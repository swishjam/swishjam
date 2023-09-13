class AddCustomerBillingSnapshots < ActiveRecord::Migration[6.1]
  def up
    execute <<~SQL
      CREATE TABLE customer_billing_data_snapshots (
        `swishjam_api_key` LowCardinality(String),
        `swishjam_owner_id` String,
        `swishjam_owner_type` Enum('user', 'organization'),
        `mrr_in_cents` UInt64,
        `total_revenue_in_cents` UInt64,
        `captured_at` DateTime DEFAULT now()
      ) 
      ENGINE = MergeTree()
      PRIMARY KEY (swishjam_owner_type, swishjam_api_key, swishjam_owner_id)
    SQL
  end

  def down
    execute("DROP TABLE customer_billing_data_snapshots")
  end
end
