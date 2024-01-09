class AddTotalNumCustomersWithPaidSubscriptionsToBillingDataSnapshots < ActiveRecord::Migration[6.1]
  def up
    execute <<~SQL
      ALTER TABLE billing_data_snapshots ADD COLUMN num_customers_with_paid_subscriptions UInt32 DEFAULT 0
    SQL
  end

  def down
    execute <<~SQL
      ALTER TABLE billing_data_snapshots DROP COLUMN num_customers_with_paid_subscriptions
    SQL
  end
end
