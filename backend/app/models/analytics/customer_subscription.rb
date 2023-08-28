module Analytics
  class CustomerSubscription < ApplicationRecord
    self.table_name = :analytics_customer_subscriptions
    belongs_to :swishjam_organization, class_name: Workspace.to_s, foreign_key: :swishjam_organization_id
    belongs_to :owner, polymorphic: true, optional: true
    has_many :subscription_items, 
              class_name: Analytics::CustomerSubscriptionItem.to_s, 
              foreign_key: :analytics_customer_subscription_id, 
              inverse_of: :customer_subscription, 
              dependent: :destroy
    accepts_nested_attributes_for :subscription_items
  end
end