class AddCanceledAtToCustomerSubscriptions < ActiveRecord::Migration[6.1]
  def change
    add_column :customer_subscriptions, :canceled_at, :datetime
  end
end
