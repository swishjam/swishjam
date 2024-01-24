module ClickHouseQueries
  module BillingDataSnapshots
    class List
      include ClickHouseQueries::Helpers
      DEFAULT_COLUMNS = %i[
        mrr_in_cents
        total_revenue_in_cents
        num_active_subscriptions
        num_free_trial_subscriptions
        num_canceled_subscriptions
        num_paid_subscriptions
        num_customers_with_paid_subscriptions
      ]

      def initialize(public_keys, columns: nil, start_time: 30.days.ago, end_time: Time.current)
        @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
        @start_time = start_time
        @end_time = end_time
        @columns = columns || DEFAULT_COLUMNS
      end

      def get
        @data ||= Analytics::ClickHouseRecord.execute_sql(sql.squish!)
      end

      def sql
        <<~SQL
          SELECT #{@columns.join(', ')}, captured_at
          FROM billing_data_snapshots
          WHERE
            swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
            captured_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
        SQL
      end
    end
  end
end