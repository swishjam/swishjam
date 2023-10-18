module ClickHouseQueries
  module Users
    module Retention
      class Weekly
        include ClickHouseQueries::Helpers

        def initialize(public_keys, oldest_cohort: 6.months.ago, oldest_activity_week: 1.weeks.ago)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @oldest_cohort = oldest_cohort.beginning_of_week
          @oldest_activity_week = oldest_activity_week.beginning_of_week
        end

        def get
          return if workspace.analytics_user_profiles.none?
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
                # this actually can happen if the user has activity data before they were identified.
                Rails.logger.error "Retention cohort has activity data that prceeds the cohort start date, this can happen if the user has activity data before they were identified, bypassing this period. Cohort: #{cohort_date}, activity period date: #{activity_period_date}"
                cohort_activity_data[:activity_periods].delete(activity_period_date)
              end
            end
          end
          retention_data_grouped_by_cohort_date
        end

        def workspace
          @workspace ||= ApiKey.includes(:workspace).find_by(public_key: @public_keys.first).workspace
        end

        def sql
          # -- 1. Define the user cohorts here
          # -- 2. Join the events with user cohorts to label each event with its user's cohort
          # -- 3. Group by cohort and week to count distinct active users
          # -- 4. Final selection to present the data
          <<~SQL
            WITH cohorts AS (
              #{
                workspace.analytics_user_profiles.map do |u|
                  "SELECT '#{u.id}' AS user_id, '#{u.created_at.beginning_of_week}' AS cohort_date"
                end.join(' UNION ALL ')
              }
            ),

            activity_with_cohorts AS (
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
              JOIN cohorts AS c ON uie.swishjam_user_id = c.user_id
              WHERE 
                e.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
                e.occurred_at >= '#{formatted_time(@oldest_activity_week)}'
            ),

            weekly_activity AS (
              SELECT
                cohort_date,
                DATE_TRUNC('week', occurred_at) AS activity_period_date,
                CAST(COUNT(DISTINCT user_id) AS INT) AS active_users
              FROM activity_with_cohorts
              GROUP BY cohort_date, DATE_TRUNC('week', occurred_at)
            ),

            cohort_sizes AS (
              SELECT cohort_date, CAST(COUNT(DISTINCT user_id) AS INT) AS cohort_size
              FROM activity_with_cohorts
              GROUP BY cohort_date
            )

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


