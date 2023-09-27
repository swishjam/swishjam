class AddMoreBillingDataSnapshotsAttributes < ActiveRecord::Migration[6.1]
  def up
    add_column :billing_data_snapshots, :num_new_customers_for_time_period, :Int32
    add_column :billing_data_snapshots, :num_new_subscriptions_for_time_period, :Int32
    add_column :billing_data_snapshots, :num_new_paid_subscriptions_for_time_period, :Int32
    add_column :billing_data_snapshots, :num_new_free_trial_subscriptions_for_time_period, :Int32
    add_column :billing_data_snapshots, :num_downgraded_subscriptions_for_time_period, :Int32
    add_column :billing_data_snapshots, :num_upgraded_subscriptions_for_time_period, :Int32
    add_column :billing_data_snapshots, :num_canceled_subscriptions_for_time_period, :Int32
    add_column :billing_data_snapshots, :num_canceled_paid_subscriptions_for_time_period, :Int32
    add_column :billing_data_snapshots, :num_paused_subscriptions_for_time_period, :Int32
    add_column :billing_data_snapshots, :num_resumed_subscriptions_for_time_period, :Int32
    add_column :billing_data_snapshots, :upgraded_mrr_amount_in_cents_for_time_period, :Int32
    add_column :billing_data_snapshots, :downgraded_mrr_amount_in_cents_for_time_period, :Int32
    add_column :billing_data_snapshots, :churned_mrr_amount_in_cents_for_time_period, :Int32
  end
end
