module Analytics
  class CustomerSubscription < ApplicationRecord
    self.table_name = :analytics_customer_subscriptions
    belongs_to :swishjam_organization, class_name: Swishjam::Organization.to_s, foreign_key: :swishjam_organization_id
  end
end