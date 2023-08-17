module Analytics
  class CustomerPayment < ApplicationRecord
    self.table_name = :analytics_customer_payments
    belongs_to :swishjam_organization, class_name: Swishjam::Organization.to_s
    belongs_to :owner, polymorphic: true, optional: true
  end
end