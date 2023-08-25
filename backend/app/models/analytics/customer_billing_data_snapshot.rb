module Analytics
  class CustomerBillingDataSnapshot < ApplicationRecord
    self.table_name = :analytics_customer_billing_data_snapshots
    belongs_to :swishjam_organization, class_name: Workspace.to_s, foreign_key: :swishjam_organization_id
    belongs_to :owner, polymorphic: true, optional: true
  end
end