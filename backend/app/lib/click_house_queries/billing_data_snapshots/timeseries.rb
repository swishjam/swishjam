module ClickHouseQueries
  module BillingDataSnapshots
    class Timeseries
      include ClickHouseQueries::Helpers
      include TimeseriesHelper
      attr_accessor :group_by, :start_time, :end_time

      def initialize(public_keys, start_time: 6.months.ago, end_time: Time.current)
        @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
        @group_by = derived_group_by(start_ts: start_time, end_ts: end_time)
        @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by)
      end

      def get
        Analytics::BillingDataSnapshot.find_by_sql(sql.squish!)
      end

      def sql
        <<~SQL
          SELECT
            DATE_TRUNC('#{group_by}', captured_at) AS rounded_captured_at,
            argMax(mrr_in_cents, captured_at) AS mrr_in_cents,
            argMax(total_revenue_in_cents, captured_at) AS total_revenue_in_cents,
            argMax(num_active_subscriptions, captured_at) AS num_active_subscriptions,
            argMax(num_free_trial_subscriptions, captured_at) AS num_free_trial_subscriptions,
            argMax(num_canceled_subscriptions, captured_at) AS num_canceled_subscriptions
          FROM billing_data_snapshots
          WHERE 
            swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
            captured_at BETWEEN '#{formatted_time(start_time)}' AND '#{formatted_time(end_time)}'
          GROUP BY rounded_captured_at
          ORDER BY rounded_captured_at ASC
        SQL
      end
    end
  end
end