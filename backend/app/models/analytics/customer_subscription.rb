module Analytics
  class CustomerSubscription < ApplicationRecord
    self.table_name = :analytics_customer_subscriptions
    belongs_to :swishjam_organization, class_name: Swishjam::Organization.to_s, foreign_key: :swishjam_organization_id
    
    # belongs_to :analytics_organization, class_name: Analytics::Organization.to_s, foreign_key: :analytics_organization_id
    # belongs_to :analytics_user, class_name: Analytics::User.to_s, foreign_key: :analytics_user_id
  end
end