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
          @churn_period_start_time = @snapshot_start_time + num_days_in_churn_period.days
          @churn_period_end_time = @snapshot_end_time + num_days_in_churn_period.days
          @num_days_in_churn_period = num_days_in_churn_period
        end

        def get
          @timeseries ||= begin
            data = Analytics::ClickHouseRecord.execute_sql(sql.squish!)
            DataFormatters::Timeseries.new(
              data,
              start_time: @churn_period_start_time,
              end_time: @churn_period_end_time,
              group_by: @group_by,
              value_method: :churn_rate,
              date_method: :churn_period_end_date,
              use_previous_value_for_missing_data: true,
            )
          end
        end

        def sql
          # snapshots.captured_at AS snapshot_date,
          # argMax(snapshots.num_customers_with_paid_subscriptions, snapshot_date) AS num_customers_with_paid_subscriptions_at_snapshot_date,
          # CAST(COUNT(DISTINCT churn_events.uuid) AS INT) AS num_churned_customers_in_period,
          <<~SQL
            SELECT 
              snapshots.captured_at + INTERVAL #{@num_days_in_churn_period} DAY AS churn_period_end_date,
              CAST(
                ROUND(
                  COUNT(DISTINCT churn_events.uuid) / 
                  argMax(snapshots.num_customers_with_paid_subscriptions, snapshots.captured_at) * 100, 2
                ) 
              AS FLOAT) AS churn_rate
            FROM billing_data_snapshots AS snapshots
            LEFT JOIN events AS churn_events ON snapshots.swishjam_api_key = churn_events.swishjam_api_key
            WHERE 
              snapshots.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              churn_events.name = '#{StripeHelpers::SupplementalEvents::Types.SUBSCRIPTION_CHURNED}' AND 
              churn_events.occurred_at >= snapshots.captured_at AND 
              churn_events.occurred_at <= snapshots.captured_at + INTERVAL #{@num_days_in_churn_period} DAY AND
              snapshots.captured_at BETWEEN '#{formatted_time(@snapshot_start_time)}' AND '#{formatted_time(@snapshot_end_time)}'
            GROUP BY churn_period_end_date
            ORDER BY churn_period_end_date
          SQL
        end
      end
    end
  end
end