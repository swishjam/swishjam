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
            CAST(COUNT(DISTINCT #{property_select_clause}) AS int) AS count,
            DATE_TRUNC('#{@group_by}', occurred_at) AS group_by_date
          FROM events AS e
          #{join_statements}
          WHERE
            e.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
            e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
            notEmpty(#{property_select_clause})
            #{@event == self.class.ANY_EVENT ? "" : " AND e.name = '#{@event}'"}
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
        elsif @distinct_count_property.nil? || @distinct_count_property == 'uuid'
          'e.uuid'
        else
          "JSONExtractString(e.properties, '#{@distinct_count_property}')"
        end
      end

      def join_statements
        return '' unless should_join_user_profiles
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
        # make sure sql starts with a space
        sql.prepend(' ') unless sql.start_with?(' ')
        sql
      end

      def should_join_user_profiles
        @distinct_count_property == 'users' || @user_profile_id.present?
      end
    end
  end
end