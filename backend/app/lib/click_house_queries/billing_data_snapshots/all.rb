module ClickHouseQueries
  module BillingDataSnapshots
    class All
      include ClickHouseQueries::Helpers
      include TimeseriesHelper

      def initialize(public_key, start_time: 6.months.ago, end_time: Time.current)
        @public_key = public_key
        @group_by = derived_group_by(start_ts: start_time, end_ts: end_time)
        @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by)
      end

      def timeseries
        Analytics::BillingDataSnapshot.find_by_sql(sql.squish!)
      end

      def sql
        <<~SQL
          SELECT
            captured_at,
            mrr_in_cents,
            total_revenue_in_cents,
            num_active_subscriptions,
            num_free_trial_subscriptions,
            num_canceled_subscriptions,
            DATE_TRUNC('#{@group_by}', captured_at) AS captured_at
          FROM billing_data_snapshots
          WHERE 
            swishjam_api_key = '#{@public_key}' AND
            captured_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
          GROUP BY captured_at, mrr_in_cents, total_revenue_in_cents, num_active_subscriptions, num_free_trial_subscriptions, num_canceled_subscriptions
          ORDER BY captured_at ASC
        SQL
      end
    end
  end
end