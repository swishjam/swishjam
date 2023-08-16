class ChangeBillingDataRelationshipsToPolymorphicOwner < ActiveRecord::Migration[6.1]
  def up
    add_reference :analytics_customer_billing_data_snapshots, :owner, polymorphic: true, index: true
    add_reference :analytics_customer_subscriptions, :owner, polymorphic: true, index: true
    rename_table :analytics_payments, :analytics_customer_payments
    add_reference :analytics_customer_payments, :owner, polymorphic: true, index: true
  end

  def down
    remove_reference :analytics_customer_billing_data_snapshots, :owner, polymorphic: true, index: true
    remove_reference :analytics_customer_subscriptions, :owner, polymorphic: true, index: true
    rename_table :analytics_customer_payments, :analytics_payments
    remove_reference :analytics_payments, :owner, polymorphic: true, index: true
  end
end
