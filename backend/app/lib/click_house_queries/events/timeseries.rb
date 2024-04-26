module ClickHouseQueries
  module Events
    class Timeseries
      include ClickHouseQueries::Helpers
      include TimeseriesHelper

      def initialize(
        public_keys, 
        event:, 
        start_time:, 
        end_time:, 
        aggregation: 'count',
        aggregated_column: nil,
        query_groups: [],
        workspace_id: nil, 
        user_profile_id: nil, 
        organization_profile_id: nil,
        group_by: nil, 
        distinct_count_property: 'uuid'
      )
        @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
        @workspace_id = workspace_id
        @event = event
        @aggregation = aggregation
        @aggregated_column = aggregated_column
        @query_groups = query_groups
        @group_by = group_by || derived_group_by(start_ts: start_time, end_ts: end_time)
        @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by)
        @user_profile_id = user_profile_id
        @organization_profile_id = organization_profile_id
        @distinct_count_property = distinct_count_property
        validate!
      end

      def get
        return @filled_in_results if defined?(@filled_in_results)
        data = Analytics::Event.find_by_sql(sql.squish!)
        DataFormatters::Timeseries.new(
          data, 
          start_time: @start_time, 
          end_time: @end_time, 
          group_by: @group_by, 
          # value_method: :count, 
          value_method: @aggregation.to_sym,
          date_method: :group_by_date,
        )
      end

      def sql
        <<~SQL
          SELECT
            #{select_statement_for_aggregation} AS #{@aggregation},
            DATE_TRUNC('#{@group_by}', e.occurred_at) AS group_by_date
          FROM (#{from_clause}) AS e
          #{maybe_users_join_statement}
          WHERE
            notEmpty(#{property_select_clause}) AND
            #{maybe_user_profile_id_where_clause} AND
            #{maybe_organization_profile_id_where_clause} AND
            #{ClickHouseQueries::FilterHelpers::DashboardComponentWhereClause.where_clause_statements(@query_groups)}
          GROUP BY group_by_date
          ORDER BY group_by_date
        SQL
      end

      def select_statement_for_aggregation
        json_extract_options = @aggregated_column && @aggregated_column.starts_with?('user.') ? "e.user_properties, '#{@aggregated_column.gsub('user.', '')}'" : "e.properties, '#{@aggregated_column}'"
        case @aggregation
        when 'count', 'users', 'unique_users', 'organizations', 'unique_organizations'
          "CAST(COUNT(DISTINCT #{property_select_clause}) AS INT)"
        when 'average', 'avg'
          "CAST(AVG(JSONExtractFloat(#{json_extract_options})) AS FLOAT)"
        when 'sum'
          "CAST(SUM(JSONExtractFloat(#{json_extract_options})) AS FLOAT)"
        when 'minimum', 'min'
          "CAST(MIN(JSONExtractFloat(#{json_extract_options})) AS FLOAT)"
        when 'maximum', 'max'
          "CAST(MAX(JSONExtractFloat(#{json_extract_options})) AS FLOAT)"
        else
          raise ArgumentError, "Unsupported aggregation: #{@aggregation}"
        end
      end

      # helpful for when you just want the distinct count of a property across any kind of event (ie: session counts)
      def self.ANY_EVENT
        'any'
      end

      def property_select_clause
        # if aggregated column is not present, it has to be a COUNT query
        if @aggregated_column.present?
          if @aggregated_column.starts_with?('user.')
            "JSONExtractString(e.user_properties, '#{@aggregated_column.gsub('user.', '')}')"
          else
            "JSONExtractString(e.properties, '#{@aggregated_column}')"
          end
        else
          if @distinct_count_property == 'users' || @aggregation == 'users'
            <<~SQL
              IF(
                isNull(user_profiles.merged_into_swishjam_user_id),
                e.user_profile_id,
                user_profiles.merged_into_swishjam_user_id
              )
            SQL
          elsif @distinct_count_property == 'organizations' || @aggregation == 'organizations'
            'e.organization_profile_id'
          elsif @distinct_count_property == 'uuid' || @distinct_count_property.nil?
            "e.uuid"
          else
            "JSONExtractString(e.properties, '#{@distinct_count_property}')"
          end
        end
      end

      def from_clause
        columns = ['occurred_at']
        columns << 'name' unless @event == self.class.ANY_EVENT
        columns << 'properties' if !['uuid', 'name', 'users'].include?(@distinct_count_property)
        columns << 'user_profile_id' if @user_profile_id || @distinct_count_property == 'users' || @aggregation == 'users'
        columns << 'user_properties' if @aggregated_column && @aggregated_column.starts_with?('user.')
        columns << 'organization_profile_id' if @organization_profile_id || @distinct_count_property == 'organizations' || @aggregation == 'organizations'
        ClickHouseQueries::Common::DeDupedEventsQuery.sql(
          public_keys: @public_keys,
          start_time: @start_time,
          end_time: @end_time,
          event_name: @event,
          all_events: @event == self.class.ANY_EVENT,
          columns: columns,
          # distinct_count_property: @distinct_count_property.nil? || @distinct_count_property == 'users' ? 'uuid' : @distinct_count_property,
        )
      end

      def maybe_users_join_statement
        sql = ''
        if @user_profile_id.present? || @distinct_count_property == 'users' || @aggregation == 'users'
          sql << <<~SQL
            LEFT JOIN (
              #{ClickHouseQueries::Common::DeDupedUserProfilesQuery.sql(workspace_id: @workspace_id, columns: ['merged_into_swishjam_user_id'])}
            ) AS user_profiles ON user_profiles.swishjam_user_id = e.user_profile_id
          SQL
        end
        sql
      end

      def maybe_user_profile_id_where_clause
        return '1 = 1' unless @user_profile_id.present?
        <<~SQL
          (
            user_profiles.swishjam_user_id = '#{@user_profile_id}' OR 
            user_profiles.merged_into_swishjam_user_id = '#{@user_profile_id}'
          )
        SQL
      end

      def maybe_organization_profile_id_where_clause
        return '1 = 1' unless @organization_profile_id.present?
        <<~SQL
          e.organization_profile_id = '#{@organization_profile_id}'
        SQL
      end

      def validate!
        if @user_profile_id.present? && @workspace_id.nil?
          raise ArgumentError, '`workspace_id` is required when `user_profile_id` is provided.'
        end
        if @aggregated_column.nil? && !['count', 'users', 'organizations'].include?(@aggregation)
          raise ArgumentError, '`aggregated_column` is required when `aggregation` is not `count`, `users`, or `organizations`.'
        end
      end

    end
  end
end