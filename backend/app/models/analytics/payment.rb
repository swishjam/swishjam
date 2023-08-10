module Analytics
  class Payment < ApplicationRecord
    self.table_name = :analytics_payments
    belongs_to :instance
  end
end