module ClickHouseQueries
  module FilterHelpers
    class LeftJoinStatementsForUserSegmentsEventFilters
      def self.left_join_statements(user_segments, users_table_alias: 'user_profiles')
        sql = ''
        return sql if user_segments.blank?
        user_segments.each do |user_segment|
          user_segment.user_segment_filters.each do |filter|
            next if filter.config['object_type'] != 'event'
            sql << left_join_statement_for_segment_filter(user_segment.workspace_id, filter.config, users_table_alias: users_table_alias)
          end
        end
        sql
      end

      def self.join_table_alias_for_segment_filter(filter_config)
        "#{filter_config['event_name'].gsub(' ', '_')}_count_for_user"
      end

      private

      def self.left_join_statement_for_segment_filter(workspace_id, filter_config, users_table_alias: 'user_profiles')
        <<~SQL
          LEFT JOIN (
            SELECT
              finalized_user_profiles.finalized_swishjam_user_id AS user_profile_id,
              CAST(COUNT(DISTINCT uuid) AS INT) AS event_count_for_user_within_lookback_period
            FROM events
            LEFT JOIN (
              SELECT
                swishjam_user_id AS user_profile_id_at_time_of_event,
                argMax (merged_into_swishjam_user_id, updated_at) AS merged_into_swishjam_user_id,
                IF (
                  isNull (merged_into_swishjam_user_id),
                  user_profile_id_at_time_of_event,
                  merged_into_swishjam_user_id
                ) AS finalized_swishjam_user_id
              FROM swishjam_user_profiles
              WHERE workspace_id = '#{workspace_id}'
              GROUP BY user_profile_id_at_time_of_event
            ) AS finalized_user_profiles ON events.user_profile_id = finalized_user_profiles.user_profile_id_at_time_of_event
            WHERE
              name = '#{filter_config['event_name']}'
              AND date_diff ('minute', occurred_at, now(), 'UTC') <= #{filter_config['num_lookback_days'] * 24 * 60}
            GROUP BY user_profile_id
          ) AS #{join_table_alias_for_segment_filter(filter_config)} ON #{users_table_alias}.swishjam_user_id = #{join_table_alias_for_segment_filter(filter_config)}.user_profile_id
        SQL
      end
    end
  end
end