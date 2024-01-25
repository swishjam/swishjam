module ClickHouseQueries
  module SaasMetrics
    class RevenuePerCustomer
      include ClickHouseQueries::Helpers
      include TimeseriesHelper

      def initialize(public_keys, start_time: 30.days.ago, end_time: Time.current)
        @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
        @group_by = derived_group_by(start_ts: start_time, end_ts: end_time)
        @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by)
      end

      def timeseries
        @results ||= begin 
          data = Analytics::ClickHouseRecord.execute_sql(sql.squish!)
          DataFormatters::MultiDimensionalTimeseries.new(
            data,
            start_time: @start_time,
            end_time: @end_time,
            group_by: @group_by,
            value_methods: %i[mrr_per_customer num_customers_with_paid_subscriptions_at_time_of_snapshot mrr_at_time_of_snapshot],
            date_method: :snapshot_time,
            use_previous_value_for_missing_data: true
          )
        end
      end

      def sql
        <<~SQL
          SELECT 
            argMax(mrr_in_cents, captured_at) AS mrr_at_time_of_snapshot,
            argMax(num_customers_with_paid_subscriptions, captured_at) AS num_customers_with_paid_subscriptions_at_time_of_snapshot,
            IF(
              num_customers_with_paid_subscriptions_at_time_of_snapshot = 0,
              0,
              mrr_at_time_of_snapshot / num_customers_with_paid_subscriptions_at_time_of_snapshot
            ) AS mrr_per_customer,
            DATE_TRUNC('#{@group_by}', captured_at) AS snapshot_time
          FROM #{Analytics::BillingDataSnapshot.table_name}
          WHERE 
            swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
            captured_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
          GROUP BY snapshot_time
          ORDER BY snapshot_time ASC
        SQL
      end
    end
  end
end