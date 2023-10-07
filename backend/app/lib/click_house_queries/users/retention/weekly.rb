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
          Analytics::Event.find_by_sql(sql.squish!).collect do |e|
            {
              cohort: e.cohort_date,
              retention_week: e.activity_week,
              num_active_users: e.active_users,
              cohort_size: e.cohort_size
            }
          end
        end

        def workspace
          @workspace ||= ApiKey.includes(:workspace).find_by(public_key: @public_keys.first).workspace
        end

        def users_by_cohort_date
          @users_by_cohort_date ||= workspace.analytics_user_profiles.where('created_at >= ?', @oldest_cohort).group_by{ |u| u.created_at.beginning_of_week }
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
                DATE_TRUNC('week', occurred_at) AS activity_week,
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
              a.activity_week,
              a.active_users,
              c.cohort_size
            FROM weekly_activity AS a
            JOIN cohort_sizes AS c ON c.cohort_date = a.cohort_date
            ORDER BY a.cohort_date, a.activity_week
          SQL
        end
      end
    end
  end
end


