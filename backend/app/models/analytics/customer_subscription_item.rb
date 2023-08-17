module Analytics
  class CustomerSubscriptionItem < ApplicationRecord
    self.table_name = :analytics_customer_subscription_items
    belongs_to :customer_subscription, class_name: Analytics::CustomerSubscription.to_s, foreign_key: :analytics_customer_subscription_id
  end
end