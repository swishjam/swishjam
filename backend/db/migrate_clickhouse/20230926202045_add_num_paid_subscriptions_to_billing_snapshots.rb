class AddNumPaidSubscriptionsToBillingSnapshots < ActiveRecord::Migration[6.1]
  def up
    execute <<~SQL
      ALTER TABLE billing_data_snapshots ADD COLUMN num_paid_subscriptions UInt32
    SQL
  end

  def down
    execute <<~SQL
      ALTER TABLE billing_data_snapshots DROP COLUMN num_paid_subscriptions
    SQL
  end
end
