module ClickHouseQueries
  module Events
    class Timeseries
      include ClickHouseQueries::Helpers
      include TimeseriesHelper

      def initialize(public_keys, event:, start_time:, end_time:, workspace_id: nil, user_profile_id: nil, group_by: nil, distinct_count_property: nil)
        @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
        @workspace_id = workspace_id
        @event = event
        @group_by = group_by || derived_group_by(start_ts: start_time, end_ts: end_time)
        @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by)
        @user_profile_id = user_profile_id
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
          value_method: :count, 
          date_method: :group_by_date,
        )
      end

      def sql
        <<~SQL
          SELECT
            CAST(COUNT(DISTINCT #{property_select_clause}) AS INT) AS count,
            DATE_TRUNC('#{@group_by}', occurred_at) AS group_by_date
          FROM (#{from_clause}) AS e
          #{join_statements}
          WHERE
            notEmpty(#{property_select_clause})
            #{user_profile_id_where_clause}
          GROUP BY group_by_date
          ORDER BY group_by_date
        SQL
      end

      # helpful for when you just want the distinct count of a property across any kind of event (ie: session counts)
      def self.ANY_EVENT
        'any'
      end

      def property_select_clause
        if @distinct_count_property == 'users'
          <<~SQL
            IF(
              isNull(user_profiles.merged_into_swishjam_user_id),
              e.user_profile_id,
              user_profiles.merged_into_swishjam_user_id
            )
          SQL
        else
          'e.distinct_count_field'
        end
      end

      def from_clause
        should_count_distinct_uuids = @distinct_count_property.nil? || @distinct_count_property == 'uuid' || @distinct_count_property == 'users'
        <<~SQL
          SELECT 
            #{should_count_distinct_uuids ? 'e.uuid' : "JSONExtractString(e.properties, '#{@distinct_count_property}')"} AS distinct_count_field,
            argMax(e.name, ingested_at) AS name, 
            argMax(e.properties, ingested_at) AS properties, 
            argMax(e.user_profile_id, ingested_at) AS user_profile_id,
            argMax(e.occurred_at, ingested_at) AS occurred_at
          FROM events AS e
          WHERE 
            e.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
            e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
            #{@event == self.class.ANY_EVENT ? "" : " AND e.name = '#{@event}'"}
          GROUP BY distinct_count_field
        SQL
      end

      def join_statements
        return '' unless @distinct_count_property == 'users' || @user_profile_id.present?
        <<~SQL
          LEFT JOIN (
            SELECT 
              swishjam_user_id, 
              argMax(merged_into_swishjam_user_id, updated_at) AS merged_into_swishjam_user_id
            FROM swishjam_user_profiles
            WHERE workspace_id = '#{@workspace_id}'
            GROUP BY swishjam_user_id
          ) AS user_profiles ON user_profiles.swishjam_user_id = e.user_profile_id
        SQL
      end

      def user_profile_id_where_clause
        return '' unless @user_profile_id.present?
        sql = <<~SQL
          AND (
            user_profiles.swishjam_user_id = '#{@user_profile_id}' OR 
            user_profiles.merged_into_swishjam_user_id = '#{@user_profile_id}'
          )
        SQL
        sql.prepend(' ') unless sql.start_with?(' ')
        sql
      end

      def validate!
        if @user_profile_id.present? && @workspace_id.nil?
          raise ArgumentError, '`workspace_id` is required when `user_profile_id` is provided.'
        end
      end
    end
  end
end