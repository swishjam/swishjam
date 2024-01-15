class CreateRevenueRetentionTables < ActiveRecord::Migration[6.1]
  def up
    execute <<~SQL
      CREATE TABLE revenue_monthly_retention_periods (
        `workspace_id` LowCardinality(String),
        `cohort_date` Date,
        `cohort_starting_mrr_in_cents` Int32,
        `cohort_starting_num_subscriptions` Int32,
        `retention_period_date` Date,
        `retention_period_mrr_in_cents` Int32,
        `retention_period_num_subscriptions` Int32,
        `calculated_at` DateTime DEFAULT now()
      )
      ENGINE = ReplacingMergeTree()
      PRIMARY KEY (workspace_id, cohort_date, retention_period_date)
    SQL
  end

  def down
    execute('DROP TABLE revenue_monthly_retention_periods')
  end
end
