module ClickHouseQueries
  module SaasMetrics
    module ChurnRate
      class Timeseries
        include ClickHouseQueries::Helpers
        include TimeseriesHelper

        def initialize(public_keys, start_time: 30.days.ago, end_time: Time.current, num_days_in_churn_period: 30)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @group_by = derived_group_by(start_ts: start_time, end_ts: end_time)
          @snapshot_start_time, @snapshot_end_time = rounded_timestamps(
            start_ts: start_time - num_days_in_churn_period.days, 
            end_ts: end_time - num_days_in_churn_period.days, 
            group_by: @group_by
          )
          @num_days_in_churn_period = num_days_in_churn_period
        end

        def get
          Analytics::ClickHouseRecord.execute_sql(sql.squish!)
        end

        def sql
          <<~SQL
            SELECT 
              snapshots.captured_at AS snapshot_date,
              snapshots.num_customers_with_paid_subscriptions AS num_customers_with_paid_subscriptions_at_snapshot_date,
              snapshots.captured_at + INTERVAL #{@num_days_in_churn_period} DAY AS churn_period_end_date,
              CAST(COUNT(churn_events.occurred_at) AS INT) AS num_churned_customers_in_period,
              CAST(ROUND(COUNT(churn_events.occurred_at) / snapshots.num_customers_with_paid_subscriptions * 100, 2) AS FLOAT) AS churn_rate
            FROM billing_data_snapshots AS snapshots
            LEFT JOIN events AS churn_events ON snapshots.swishjam_api_key = churn_events.swishjam_api_key
            WHERE 
              snapshots.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              churn_events.name = 'stripe.supplemental.customer.churned' AND 
              churn_events.occurred_at >= snapshots.captured_at AND 
              churn_events.occurred_at <= snapshots.captured_at + INTERVAL #{@num_days_in_churn_period} DAY AND
              snapshots.captured_at BETWEEN '#{formatted_time(@snapshot_start_time)}' AND '#{formatted_time(@snapshot_end_time)}'
            GROUP BY snapshot_date, num_customers_with_paid_subscriptions_at_snapshot_date
            ORDER BY snapshot_date
          SQL
        end
      end
    end
  end
end