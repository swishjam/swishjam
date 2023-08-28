class SubscriptionAndRevenueTables < ActiveRecord::Migration[6.1]
  def up
    create_table :billing_data_snapshots, options: 'MergeTree() ORDER BY (swishjam_api_key, captured_at)' do |t|
      t.string :swishjam_api_key, null: false
      t.datetime :captured_at, null: false
      t.integer :mrr_in_cents, null: false
      t.integer :total_revenue_in_cents, null: false
      t.integer :num_active_subscriptions, null: false
      t.integer :num_free_trial_subscriptions, null: false
      t.integer :num_canceled_subscriptions, null: false
    end
  end
end
