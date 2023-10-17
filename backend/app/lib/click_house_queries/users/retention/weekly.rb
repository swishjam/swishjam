module ClickHouseQueries
  module Users
    module Retention
      class Weekly
        include ClickHouseQueries::Helpers

        def initialize(public_keys, oldest_cohort_date: 6.months.ago, oldest_activity_week: 1.weeks.ago)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @oldest_cohort_date = oldest_cohort_date.beginning_of_week
          @oldest_activity_week = oldest_activity_week.beginning_of_week
        end

        def get
          raw_retention_data = Analytics::Event.find_by_sql(sql.squish!)
          retention_data_grouped_by_cohort_date = format_result_into_cohort_key_values(raw_retention_data)
          fill_in_retention_data_with_period_counts_and_zero_user_periods(retention_data_grouped_by_cohort_date)
        end

        private

        def format_result_into_cohort_key_values(results)
          retention_data_grouped_by_cohort_date = {}
          results.each do |activity_period_data|
            retention_data_grouped_by_cohort_date[activity_period_data.cohort_date.to_date.to_s] ||= { 
              cohort_size: activity_period_data.cohort_size,
              activity_periods: {}
            }
            retention_data_grouped_by_cohort_date[activity_period_data.cohort_date.to_date.to_s][:activity_periods][activity_period_data.activity_period_date] = { 
              num_active_users: activity_period_data.active_users 
            }
          end
          retention_data_grouped_by_cohort_date
        end

        def fill_in_retention_data_with_period_counts_and_zero_user_periods(retention_data_grouped_by_cohort_date)
          retention_data_grouped_by_cohort_date.each do |cohort_date, cohort_activity_data|
            current_retention_activity_period = cohort_date.to_date
            num_periods_after_cohort = 0
            while current_retention_activity_period <= Time.current.beginning_of_week.to_date
              cohort_activity_data[:activity_periods][current_retention_activity_period.to_s] ||= { num_active_users: 0 }
              cohort_activity_data[:activity_periods][current_retention_activity_period.to_s][:num_periods_after_cohort] = num_periods_after_cohort
              num_periods_after_cohort += 1
              current_retention_activity_period += 1.week
            end

            cohort_activity_data[:activity_periods].each do |activity_period_date, activity_period_data|
              if activity_period_date.to_date < cohort_date.to_date
                Rails.logger.error "Retention cohort has activity data that prceeds the cohort start date, this should not happen. Cohort: #{cohort_date}, activity period date: #{activity_period_date}"
                cohort_activity_data[:activity_periods].delete(activity_period_date)
              end
            end
          end
          retention_data_grouped_by_cohort_date
        end

        def cohorts_sql_query
          # returns all user ids and their cohort dates
          # toStartOfWeek(date, mode) mode = 1 -> Monday is start of week, range of 0-53 (aligns with Ruby's `.beginning_of_week`)
          # https://clickhouse.com/docs/en/sql-reference/functions/date-time-functions#toweek
          <<~SQL
            SELECT swishjam_user_id, toStartOfWeek(created_at, 1) AS cohort_date
            FROM swishjam_user_profiles
            WHERE 
              swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              created_at >= '#{formatted_time(@oldest_cohort_date)}'
          SQL
        end

        def activity_for_cohorts_sql_query
          # gets all activity from users thats cohorts are within the @oldest_cohort_date
          <<~SQL
            SELECT 
              e.occurred_at AS occurred_at, 
              uie.swishjam_user_id AS user_id, 
              c.cohort_date AS cohort_date
            FROM events AS e
            LEFT JOIN (
              SELECT
                device_identifier,
                MAX(occurred_at) AS max_occurred_at,
                argMax(swishjam_user_id, occurred_at) AS swishjam_user_id
              FROM user_identify_events AS uie
              WHERE swishjam_api_key IN #{formatted_in_clause(@public_keys)}
              GROUP BY device_identifier
            ) AS uie ON uie.device_identifier = JSONExtractString(e.properties, '#{Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER}')
            JOIN cohorts AS c ON uie.swishjam_user_id = c.swishjam_user_id
            WHERE 
              e.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              e.occurred_at >= '#{formatted_time(@oldest_activity_week)}'
          SQL
        end

        def weekly_activity_sql_query
          <<~SQL
            SELECT
              cohort_date,
              toStartOfWeek(occurred_at, 1) AS activity_period_date,
              CAST(COUNT(DISTINCT user_id) AS INT) AS active_users
            FROM activity_with_cohorts
            GROUP BY cohort_date, toStartOfWeek(occurred_at, 1)
          SQL
        end

        def cohort_sizes_sql_query
          <<~SQL
            SELECT cohort_date, CAST(COUNT(DISTINCT user_id) AS INT) AS cohort_size
            FROM activity_with_cohorts
            GROUP BY cohort_date
          SQL
        end

        def sql
          # -- 1. Define the user cohorts here
          # -- 2. Join the events with user cohorts to label each event with its user's cohort
          # -- 3. Group by cohort and week to count distinct active users
          # -- 4. Final selection to present the data
          <<~SQL
            WITH cohorts AS (#{cohorts_sql_query}),
            activity_with_cohorts AS (#{activity_for_cohorts_sql_query}),
            weekly_activity AS (#{weekly_activity_sql_query}),
            cohort_sizes AS (#{cohort_sizes_sql_query})

            SELECT 
              a.cohort_date,
              a.activity_period_date,
              a.active_users,
              c.cohort_size
            FROM weekly_activity AS a
            JOIN cohort_sizes AS c ON c.cohort_date = a.cohort_date
            ORDER BY a.cohort_date, a.activity_period_date
          SQL
        end
      end
    end
  end
end


