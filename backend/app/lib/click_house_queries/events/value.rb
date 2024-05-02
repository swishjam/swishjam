module ClickHouseQueries
  module Events
    class Value
      include ClickHouseQueries::Helpers

      def initialize(
        public_keys, 
        event:, 
        start_time:, 
        end_time:, 
        aggregation_method: 'count',
        aggregated_column: nil,
        query_groups: [],
        workspace_id: nil, 
        user_profile_id: nil, 
        organization_profile_id: nil,
        group_by: nil, 
        distinct_count_property: nil
      )
        @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
        @workspace_id = workspace_id
        @event = event
        @query_groups = query_groups
        # one of count, users, organizations, average, sum, minimum, maximum
        @aggregation_method = aggregation_method
        # if `aggregation_method` is `count`, `users`, or `organizations` (ie: a count-based query), then `aggregated_column` is not required
        # if `aggregation_method` is `average`, `sum`, `minimum`, or `maximum`, then `aggregated_column` is required because we need to know 
        # which event or user property to calculate against
        @aggregated_column = aggregated_column
        # we only use the `distinct_count_property` for "count-based" queries (ie: count of distinct events, users, organizations)
        # count of events this should be `uuid`, for users this should be `users`, for organizations this should be `organizations`
        # we handle distinct users differently because we need to check if the user has been merged or not (see line 107)
        # for count of sessions or page_views, this would be `session_identifier` or `page_view_identifier`
        @distinct_count_property = distinct_count_property || is_distinct_count_query? ? 'uuid' : nil
        @group_by = group_by
        @user_profile_id = user_profile_id
        @organization_profile_id = organization_profile_id
        @start_time = start_time
        @end_time = end_time
        validate!
      end

      def get
        @value ||= Analytics::Event.find_by_sql(sql.squish!).first[@aggregation_method]
      end

      def sql
        <<~SQL
          SELECT #{select_statement_for_aggregation} AS #{@aggregation_method}
          FROM (#{from_clause}) AS e
          #{maybe_users_join_statement}
          WHERE
            notEmpty(#{property_select_clause}) AND
            #{maybe_user_profile_id_where_clause} AND
            #{maybe_organization_profile_id_where_clause} AND
            #{ClickHouseQueries::FilterHelpers::DashboardComponentWhereClause.where_clause_statements(@query_groups)}
          #{maybe_group_by_statement}
        SQL
      end

      def select_statement_for_aggregation
        if is_distinct_count_query?
          return "CAST(COUNT(DISTINCT #{property_select_clause}) AS INT)"
        end
        json_extract_options = @aggregated_column && @aggregated_column.starts_with?('user.') ? "e.user_properties, '#{@aggregated_column.gsub('user.', '')}'" : "e.properties, '#{@aggregated_column}'"
        case @aggregation_method
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
          raise ArgumentError, "Unsupported aggregation_method: #{@aggregation_method}"
        end
      end

      # helpful for when you just want the distinct count of a property across any kind of event (ie: session counts)
      def self.ANY_EVENT
        'any'
      end

      def property_select_clause
        if is_distinct_count_query?
          if @distinct_count_property == 'users' || @aggregation_method == 'users'
            <<~SQL
              IF(
                isNull(user_profiles.merged_into_swishjam_user_id),
                e.user_profile_id,
                user_profiles.merged_into_swishjam_user_id
              )
            SQL
          elsif @distinct_count_property == 'organizations' || @aggregation_method == 'organizations'
            'e.organization_profile_id'
          elsif @distinct_count_property == 'uuid' || @distinct_count_property.nil?
            "e.uuid"
          else
            "JSONExtractString(e.properties, '#{@distinct_count_property}')"
          end
        else
          # it's a math-based aggregation_method, so aggregated_column is defined/required/validated
          if @aggregated_column.starts_with?('user.')
            "JSONExtractString(e.user_properties, '#{@aggregated_column.gsub('user.', '')}')"
          else
            "JSONExtractString(e.properties, '#{@aggregated_column}')"
          end
        end
      end

      def from_clause
        columns = ['occurred_at']
        columns << 'name' unless @event == self.class.ANY_EVENT
        columns << 'properties' if requires_properties_column?
        columns << 'user_profile_id' if @user_profile_id || @distinct_count_property == 'users' || @aggregation_method == 'users'
        columns << 'user_properties' if requires_user_properties_column?
        columns << 'organization_properties' if requires_organization_properties_column?
        columns << 'organization_profile_id' if @organization_profile_id || @distinct_count_property == 'organizations' || @aggregation_method == 'organizations'
        ClickHouseQueries::Common::DeDupedEventsQuery.sql(
          public_keys: @public_keys,
          start_time: @start_time,
          end_time: @end_time,
          event_name: @event,
          all_events: @event == self.class.ANY_EVENT,
          columns: columns,
          group_by_column: is_distinct_count_query? ? 'uuid' : @distinct_count_property,
        )
      end

      def requires_properties_column?
        return true if @distinct_count_property && !@distinct_count_property.in?(['uuid', 'name', 'users']) && !@distinct_count_property.starts_with?('user.')
        return true if @aggregated_column && !@aggregated_column.starts_with?('user.')
        return true if @query_groups.any? { |group| (group['queries'] || []).any? { |query| query['property'] && !query['property'].starts_with?('user.') }}
        return true if @group_by && !@group_by.starts_with?('user.') && !@group_by.starts_with?('organization.')
        false
      end

      def requires_user_properties_column?
        return true if @distinct_count_property && @distinct_count_property.starts_with?('user.')
        return true if @aggregated_column && @aggregated_column.starts_with?('user.')
        return true if @query_groups.any? { |group| (group['queries'] || []).any? { |query| query['property'] && query['property'].starts_with?('user.') }}
        return true if @group_by && @group_by.starts_with?('user.')
        false
      end

      def requires_organization_properties_column?
        return true if @distinct_count_property && @distinct_count_property.starts_with?('organization.')
        return true if @aggregated_column && @aggregated_column.starts_with?('organization.')
        return true if @query_groups.any? { |group| (group['queries'] || []).any? { |query| query['property'] && query['property'].starts_with?('organization.') }}
        return true if @group_by && @group_by.starts_with?('organization.')
        false
      end

      def maybe_users_join_statement
        sql = ''
        if @user_profile_id.present? || @distinct_count_property == 'users' || @aggregation_method == 'users'
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

      def maybe_group_by_statement
        return '' unless @group_by.present?
        group_column = nil
        if @group_by.starts_with?('user.')
          group_column = "JSONExtractString(e.user_properties, '#{@group_by.gsub('user.', '')}')"
        elsif @group_by.starts_with?('organization.')
          group_column = "JSONExtractString(e.organization_properties, '#{@group_by.gsub('organization.', '')}')"
        else
          group_column = "JSONExtractString(e.properties, '#{@group_by}')"
        end
        "GROUP BY #{group_column}"
      end

      def is_distinct_count_query?
        @aggregation_method.in?(['count', 'users', 'unique_users', 'organizations', 'unique_organizations'])
      end

      def validate!
        if @user_profile_id.present? && @workspace_id.nil?
          raise ArgumentError, '`workspace_id` is required when `user_profile_id` is provided.'
        end
        if @aggregated_column.nil? && !is_distinct_count_query?
          raise ArgumentError, '`aggregated_column` is required when `aggregation_method` is not `count`, `users`, or `organizations`.'
        end
      end

    end
  end
end