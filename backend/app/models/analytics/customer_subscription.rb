module Analytics
  class CustomerSubscription < ApplicationRecord
    self.table_name = :analytics_customer_subscriptions
    belongs_to :instance
  end
end