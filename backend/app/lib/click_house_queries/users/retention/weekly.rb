module ClickHouseQueries
  module Users
    module Retention
      class Weekly
        include ClickHouseQueries::Helpers

        def initialize(public_keys, oldest_cohort_date: nil, events_to_be_considered_active: nil)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @oldest_cohort_date = (oldest_cohort_date || 4.weeks.ago).beginning_of_week
          @events_to_be_considered_active = events_to_be_considered_active
        end

        def get
          formatted_retention_data = {}
          formatted_query_results.each do |row|
            if formatted_retention_data[row['cohort_period']].nil?
              formatted_retention_data[row['cohort_period']] = {}
            end
            formatted_retention_data[row['cohort_period']][row['activity_period']] = row['num_active_users']
          end
          formatted_retention_data
        end

        def formatted_query_results
          result = Analytics::ClickHouseRecord.connected_to(role: :reading) do
            Analytics::ClickHouseRecord.connection.execute(sql)
          end

          meta = result['meta']
          data = result['data']

          data.map do |row|
            row.each_with_index.with_object({}) do |(value, index), hash|
              column_name = meta[index]['name']
              hash[column_name] = value
            end
          end
        end

        def sql
          <<~SQL
            SELECT 
              cohort_period AS cohort_period, 
              activity_period AS activity_period, 
              CAST(COUNT(DISTINCT swishjam_user_id) AS INT) AS num_active_users 
            FROM ( 
              SELECT 
                swishjam_user_profiles.swishjam_user_id AS swishjam_user_id, 
                toStartOfWeek(swishjam_user_profiles.created_at, 1) AS cohort_period, 
                toStartOfWeek(e.occurred_at, 1) AS activity_period,
                e.name 
              FROM swishjam_user_profiles 
              INNER JOIN ( 
                SELECT 
                  device_identifier, 
                  argMax(swishjam_user_id, occurred_at) AS swishjam_user_id 
                FROM user_identify_events 
                WHERE swishjam_api_key in #{formatted_in_clause(@public_keys)}
                GROUP BY device_identifier 
              ) AS uie ON swishjam_user_profiles.swishjam_user_id = uie.swishjam_user_id 
              INNER JOIN events AS e ON 
                JSONExtractString(e.properties, 'device_identifier') = uie.device_identifier AND 
                e.occurred_at >= '#{formatted_time(@oldest_cohort_date)}' AND 
                e.swishjam_api_key IN #{formatted_in_clause(@public_keys)}
                #{@events_to_be_considered_active ? " AND e.name IN #{formatted_in_clause(@events_to_be_considered_active)}" : nil}
              WHERE 
                swishjam_user_profiles.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND 
                swishjam_user_profiles.created_at >= '#{formatted_time(@oldest_cohort_date)}' 
            ) subquery 
            GROUP BY cohort_period, activity_period 
            ORDER BY cohort_period, activity_period
          SQL
        end
      end
    end
  end
end