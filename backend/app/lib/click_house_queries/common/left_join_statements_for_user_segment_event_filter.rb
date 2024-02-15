module ClickHouseQueries
  module Common
    class LeftJoinStatementsForUserSegmentEventFilter
      def self.left_join_statement(filter_config, users_table_alias: 'user_profiles')
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
              GROUP BY user_profile_id_at_time_of_event
            ) AS finalized_user_profiles ON events.user_profile_id = finalized_user_profiles.user_profile_id_at_time_of_event
            WHERE
              name = '#{filter_config['event_name']}'
              AND date_diff ('minute', occurred_at, now(), 'UTC') <= #{filter_config['num_lookback_days'] * 24 * 60}
            GROUP BY user_profile_id
          ) AS #{filter_config['event_name']}_count_for_user ON #{users_table_alias}.swishjam_user_id = #{filter_config['event_name']}_count_for_user.user_profile_id
        SQL
      end
    end
  end
end