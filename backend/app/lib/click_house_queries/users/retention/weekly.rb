module ClickHouseQueries
  module Users
    module Retention
      class Weekly
        include ClickHouseQueries::Helpers

        def initialize(public_keys:, workspace_id:, oldest_cohort_date: 4.weeks.ago, events_to_be_considered_active: nil)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @workspace_id = workspace_id
          @oldest_cohort_date = oldest_cohort_date.beginning_of_week
          @events_to_be_considered_active = events_to_be_considered_active
        end

        def get_cohort_sizes
          cohort_sizes_sql = <<~SQL
            SELECT
              toStartOfWeek(first_seen_at_in_web_app, 1) AS cohort_period,
              CAST(
                COUNT(
                  DISTINCT IF(
                    isNull(merged_into_swishjam_user_id),
                    swishjam_user_id,
                    merged_into_swishjam_user_id
                  )
                ) 
              AS INT) AS num_users_in_cohort
            FROM (
              SELECT 
                swishjam_user_id,
                argMax(first_seen_at_in_web_app, updated_at) AS first_seen_at_in_web_app,
                argMax(merged_into_swishjam_user_id, updated_at) AS merged_into_swishjam_user_id
              FROM swishjam_user_profiles AS profiles
              WHERE
                workspace_id = '#{@workspace_id}' AND
                profiles.first_seen_at_in_web_app >= '#{formatted_time(@oldest_cohort_date)}'
              GROUP BY swishjam_user_id
            )
            WHERE 
              isNull(merged_into_swishjam_user_id) AND
              notEmpty(toString(first_seen_at_in_web_app))
            GROUP BY cohort_period
            ORDER BY cohort_period
          SQL
          Analytics::ClickHouseRecord.execute_sql(cohort_sizes_sql)
        end

        def get_activity_data_by_cohorts
          Analytics::ClickHouseRecord.execute_sql(sql)
        end

        def sql
          <<~SQL
            SELECT 
              toStartOfWeek(profiles.first_seen_at_in_web_app, 1) as cohort_period,
              toStartOfWeek(e.occurred_at, 1) as activity_period,
              CAST(
                COUNT(
                  DISTINCT IF(
                    isNull(profiles.merged_into_swishjam_user_id),
                    profiles.swishjam_user_id,
                    profiles.merged_into_swishjam_user_id
                  )
                )
              AS INT) AS num_active_users
            FROM events AS e
            INNER JOIN (
              SELECT 
                swishjam_user_id,  
                argMax(merged_into_swishjam_user_id, updated_at) AS merged_into_swishjam_user_id,
                argMax(first_seen_at_in_web_app, updated_at) AS first_seen_at_in_web_app
              FROM swishjam_user_profiles
              GROUP BY swishjam_user_id
            ) AS profiles on profiles.swishjam_user_id = e.user_profile_id
            WHERE
              e.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              profiles.first_seen_at_in_web_app >= '#{formatted_time(@oldest_cohort_date)}' AND
              e.occurred_at >= '#{formatted_time(@oldest_cohort_date)}'
              #{active_events_where_clause}
            GROUP BY cohort_period, activity_period
            ORDER BY cohort_period, activity_period
          SQL
        end

        def active_events_where_clause
          return '' if @events_to_be_considered_active.blank?
          " AND e.name IN #{formatted_in_clause(@events_to_be_considered_active)}"
        end
      end
    end
  end
end