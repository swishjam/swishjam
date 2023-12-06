class AddSubscriptionTablesToSupabase < ActiveRecord::Migration[6.1]
  def change
    create_table :customer_subscriptions, id: :uuid do |t|
      t.references :workspace, type: :uuid, null: false, index: true
      t.references :parent_profile, polymorphic: true, type: :uuid, null: false, index: true
      t.string :subscription_provider_object_id, null: false, index: true
      t.string :subscription_provider, null: false, index: true
      t.string :status, null: false, index: true
    end

    create_table :customer_subscription_items, id: :uuid do |t|
      t.references :customer_subscription, type: :uuid, null: false, index: true
      t.string :subscription_provider_object_id, null: false, index: { name: 'index_customer_sub_items_on_sub_provider_object_id' }
      t.integer :quantity, null: false
      t.string :product_name, null: false
      t.integer :price_unit_amount, null: false
      t.string :price_nickname
      t.string :price_billing_scheme, null: false
      t.string :price_recurring_interval, null: false
      t.integer :price_recurring_interval_count, null: false
      t.string :price_recurring_usage_type, null: false
    end
  end
end
