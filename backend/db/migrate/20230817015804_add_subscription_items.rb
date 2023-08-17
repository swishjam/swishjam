class AddSubscriptionItems < ActiveRecord::Migration[6.1]
  def up
    create_table :analytics_customer_subscription_items, id: :uuid do |t|
      t.references :analytics_customer_subscription, type: :uuid, index: { name: 'index_a_customer_subscription_items_on_subscription_id' }
      t.integer :quantity
      t.integer :unit_amount_in_cents
      t.string :interval
      t.string :plan_name
      t.timestamps
    end
  end

  def down
    drop_table :analytics_customer_subscription_items
  end
end
