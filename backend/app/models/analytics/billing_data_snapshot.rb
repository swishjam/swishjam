module Analytics
  class BillingDataSnapshot < ApplicationRecord
    self.table_name = :analytics_billing_data_snapshots
    belongs_to :instance
  end
end