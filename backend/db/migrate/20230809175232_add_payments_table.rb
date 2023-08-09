class AddPaymentsTable < ActiveRecord::Migration[6.1]
  def up
    create_table :analytics_payments do |t|
      t.references :instance, null: false, foreign_key: true
      t.string :payment_processor
      t.string :provider_id
      t.string :customer_email
      t.string :customer_name
      t.integer :amount_in_cents
      t.timestamp :charged_at
      t.string :status
      t.timestamps
    end

    create_table :analytics_customer_subscriptions do |t|
      t.references :instance, null: false, foreign_key: true
      t.string :payment_processor
      t.string :provider_id
      t.string :customer_email
      t.string :customer_name
      t.integer :amount_in_cents
      t.string :interval
      t.string :plan_name
      t.string :status
      t.timestamp :started_at
      t.timestamp :next_charge_runs_at
      t.timestamp :ends_at
      t.timestamp :free_trial_starts_at
      t.timestamp :free_trial_ends_at
      t.timestamps
    end

    create_table :analytics_customer_billing_data_snapshots do |t|
      t.references :instance, null: false, foreign_key: true
      t.string :customer_email
      t.string :customer_name
      t.integer :mrr_in_cents
      t.integer :total_revenue_in_cents
      t.timestamp :captured_at
      t.timestamps
    end

    rename_table :billing_data_snapshots, :analytics_billing_data_snapshots
  end

  def down
    drop_table :analytics_payments
    drop_table :analytics_customer_subscriptions
    drop_table :analytics_customer_billing_data_snapshots
    rename_table :analytics_billing_data_snapshots, :billing_data_snapshots
  end
end
