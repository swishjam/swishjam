module ClickHouseQueries
  module SaasMetrics
    module ChurnRate
      class Timeseries
        include ClickHouseQueries::Helpers
        include TimeseriesHelper

        def initialize(public_keys, start_time: 6.months.ago, end_time: Time.current, percentage_precision: 3, num_days_in_churn_period: 30)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @group_by = derived_group_by(start_ts: start_time, end_ts: end_time)
          @snapshot_start_time, @snapshot_end_time = rounded_timestamps(start_ts: start_time - 30.days, end_ts: end_time - 30.days, group_by: @group_by)
          @percentage_precision = percentage_precision
          @num_days_in_churn_period = num_days_in_churn_period
        end

        def get
          Analytics::ClickHouseRecord.execute_sql(sql.squish!)
        end

        def sql
          THIS IS SO CLOSE! CLICKHOUSE DOESNT SUPPORT NON EQUI JOIN CONDITIONS
          MAYBE WE CAN NORMALIZE THE DATES SOMEHOW TO EXTRACT THE MONTH OR USE SOME KIND OF MODULE OPERATOR?
          <<~SQL
            SELECT
              bds.snapshot_date + INTERVAL #{@num_days_in_churn_period} DAY AS churn_date,
              ROUND(CASE 
                WHEN MAX(bds.num_customers_with_paid_subscriptions) > 0 THEN
                  SUM(CASE WHEN e.uuid IS NULL OR e.uuid = '' THEN 0 ELSE 1 END) * 100.0 / MAX(bds.num_customers_with_paid_subscriptions)
                ELSE 0
              END, #{@percentage_precision}) AS churn_rate_percentage
            FROM (
              SELECT
                DATE_TRUNC('day', captured_at) AS snapshot_date,
                MAX(num_customers_with_paid_subscriptions) AS num_customers_with_paid_subscriptions
              FROM billing_data_snapshots
              WHERE 
                swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
                captured_at BETWEEN '#{formatted_time(@snapshot_start_time)}' AND '#{formatted_time(@snapshot_end_time)}'
              GROUP BY snapshot_date
            ) AS bds
            LEFT JOIN events AS e ON e.occurred_at >= bds.snapshot_date 
              AND e.occurred_at <= bds.snapshot_date + INTERVAL #{@num_days_in_churn_period} DAY
              AND e.name = 'stripe.supplemental.customer.churned' 
              AND e.swishjam_api_key IN #{formatted_in_clause(@public_keys)}
            GROUP BY churn_date
            ORDER BY churn_date ASC
          SQL
        end
      end
    end
  end
end