class AddBillingData < ActiveRecord::Migration[6.1]
  def up
    create_table :billing_data_snapshots do |t|
      t.references :instance
      t.integer :mrr_in_cents
      t.integer :total_revenue_in_cents
      t.integer :num_active_subscriptions
      t.integer :num_free_trial_subscriptions
      t.integer :num_canceled_subscriptions
      t.timestamp :captured_at
      t.timestamps
    end
  end

  def down
    drop_table :billing_data_snapshots
  end
end
