module ClickHouseQueries
  module SaasMetrics
    class RevenueRetention
      include ClickHouseQueries::Helpers

      def initialize(workspace_id, starting_cohort_date:)
        @workspace_id = workspace_id
        @starting_cohort_date = starting_cohort_date
      end

      def get
        Analytics::ClickHouseRecord.execute_sql(sql.squish!)
      end

      def sql
        <<~SQL
          SELECT 
            cohort_date, 
            retention_period_date,
            argMax(cohort_starting_mrr_in_cents, calculated_at) AS cohort_starting_mrr_in_cents,
            argMax(cohort_starting_num_subscriptions, calculated_at) AS cohort_starting_num_subscriptions,
            argMax(retention_period_mrr_in_cents, calculated_at) AS retention_period_mrr_in_cents
          FROM #{Analytics::RevenueMonthlyRetentionPeriod.table_name}
          WHERE 
            workspace_id = '#{@workspace_id}' AND
            cohort_date >= '#{formatted_date(@starting_cohort_date)}'
          GROUP BY cohort_date, retention_period_date
        SQL
      end
    end
  end
end