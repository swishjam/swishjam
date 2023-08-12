module Analytics
  class CustomerBillingDataSnapshot < ApplicationRecord
    self.table_name = :analytics_customer_billing_data_snapshots
    belongs_to :swishjam_organization, class_name: Swishjam::Organization.to_s
  end
end