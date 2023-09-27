class AddNumPaidSubscriptionsToBillingSnapshots < ActiveRecord::Migration[6.1]
  def up
    add_column :billing_data_snapshots, :num_paid_subscriptions, 'Int32'
  end

  def down
    remove_column :billing_data_snapshots, :num_paid_subscriptions
  end
end
