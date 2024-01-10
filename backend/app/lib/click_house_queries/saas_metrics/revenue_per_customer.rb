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
          DataFormatters::Timeseries.new(
            data,
            start_time: @start_time,
            end_time: @end_time,
            group_by: @group_by,
            value_method: :revenue_per_customer,
            date_method: :group_by_date,
            use_previous_value_for_missing_data: true
          )
        end
      end

      def sql
        # argMax(num_customers_with_paid_subscriptions, captured_at) AS num_customers_with_paid_subscriptions_at_time_of_snapshot,
        # argMax(total_revenue_in_cents, captured_at) AS total_revenue_in_cents_at_time_of_snapshot,
        # MAX(captured_at) AS snapshot_time,
        <<~SQL
          SELECT 
            argMax(total_revenue_in_cents, captured_at) / argMax(num_customers_with_paid_subscriptions, captured_at) AS revenue_per_customer,
            DATE_TRUNC('#{@group_by}', captured_at) AS group_by_date
          FROM #{Analytics::BillingDataSnapshot.table_name}
          WHERE 
            swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
            captured_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
          GROUP BY group_by_date
          ORDER BY group_by_date ASC
        SQL
      end
    end
  end
end