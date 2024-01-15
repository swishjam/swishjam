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
            DataFormatters::MultiDimensionalTimeseries.new(
              data,
              start_time: @churn_period_start_time,
              end_time: @churn_period_end_time,
              group_by: @group_by,
              value_methods: %i[num_active_subscriptions_at_snapshot_date num_new_subscriptions_in_period num_churned_subscriptions_in_period churn_rate snapshot_date],
              date_method: :churn_period_end_date,
              use_previous_value_for_missing_data: true,
            )
          end
        end

        def sql
          <<~SQL
            SELECT 
              snapshots.captured_at AS snapshot_date,
              snapshots.captured_at + INTERVAL #{@num_days_in_churn_period} DAY AS churn_period_end_date,
              argMax(snapshots.num_active_subscriptions, snapshots.captured_at) AS num_active_subscriptions_at_snapshot_date,
              CAST(COUNT(DISTINCT new_subscription_events.uuid) AS INT) AS num_new_subscriptions_in_period,
              CAST(COUNT(DISTINCT churn_events.uuid) AS INT) AS num_churned_subscriptions_in_period,
              CAST(ROUND(num_churned_subscriptions_in_period / (num_active_subscriptions_at_snapshot_date + num_new_subscriptions_in_period) * 100, 2) AS FLOAT) AS churn_rate
            FROM billing_data_snapshots AS snapshots
            LEFT JOIN events AS churn_events ON 
              snapshots.swishjam_api_key = churn_events.swishjam_api_key AND 
              churn_events.name = '#{StripeHelpers::SupplementalEvents::SubscriptionChurned.EVENT_NAME}'
            LEFT JOIN events AS new_subscription_events ON
              snapshots.swishjam_api_key = new_subscription_events.swishjam_api_key AND
              new_subscription_events.name = '#{StripeHelpers::SupplementalEvents::NewActiveSubscription.EVENT_NAME}'
            WHERE 
              snapshots.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              churn_events.occurred_at >= snapshots.captured_at AND 
              churn_events.occurred_at <= snapshots.captured_at + INTERVAL #{@num_days_in_churn_period} DAY AND
              new_subscription_events.occurred_at >= snapshots.captured_at AND
              new_subscription_events.occurred_at <= snapshots.captured_at + INTERVAL #{@num_days_in_churn_period} DAY AND
              snapshots.captured_at BETWEEN '#{formatted_time(@snapshot_start_time)}' AND '#{formatted_time(@snapshot_end_time)}'
            GROUP BY snapshot_date, churn_period_end_date
            ORDER BY churn_period_end_date
          SQL
        end
      end
    end
  end
end