class CreateBillingData < ActiveRecord::Migration[6.1]
  def up
    execute <<-SQL
      CREATE TABLE billing_data_snapshots (
        `swishjam_api_key` LowCardinality(String),
        `mrr_in_cents` UInt32,
        `total_revenue_in_cents` UInt32,
        `num_active_subscriptions` UInt32,
        `num_free_trial_subscriptions` UInt32,
        `num_canceled_subscriptions` UInt32,
        `captured_at` DateTime
      ) 
      ENGINE = MergeTree()
      PRIMARY KEY (swishjam_api_key, captured_at)
    SQL
  end

  def down
    execute('DROP TABLE IF EXISTS billing_data_snapshots')
  end
end
