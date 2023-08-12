module Analytics
  class BillingDataSnapshot < ApplicationRecord
    self.table_name = :analytics_billing_data_snapshots
    belongs_to :swishjam_organization, class_name: Swishjam::Organization.to_s, foreign_key: :swishjam_organization_id
  end
end