module ClickHouseQueries
  module Users
    module Active
      class Count
        include ClickHouseQueries::Helpers

        def initialize(public_keys, start_time:, end_time: Time.current)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @start_time = start_time
          @end_time = end_time
        end

        def count
          Analytics::Event.find_by_sql(sql.squish!).first.num_unique_users
        end

        def sql
          <<~SQL
            SELECT 
              CAST(COUNT(DISTINCT
                IF(
                  isNull(user_profiles.merged_into_swishjam_user_id),
                  IF(
                    isNull(events.user_profile_id),
                    JSONExtractString(events.properties, 'device_identifier'),
                    events.user_profile_id
                  ),
                  user_profiles.merged_into_swishjam_user_id
                )
              ) AS int) AS num_unique_users
            FROM events
            LEFT JOIN (
              SELECT 
                swishjam_user_id, 
                argMax(merged_into_swishjam_user_id, updated_at) AS merged_into_swishjam_user_id
              FROM swishjam_user_profiles
              WHERE swishjam_api_key IN #{formatted_in_clause(@public_keys)}
              GROUP BY swishjam_user_id
            ) AS user_profiles ON user_profiles.swishjam_user_id = events.user_profile_id
            WHERE
              events.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              events.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
          SQL
        end
      end
    end
  end
end
