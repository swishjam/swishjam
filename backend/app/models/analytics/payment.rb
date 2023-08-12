module Analytics
  class Payment < ApplicationRecord
    self.table_name = :analytics_payments
    belongs_to :swishjam_organization, class_name: Swishjam::Organization.to_s
  end
end