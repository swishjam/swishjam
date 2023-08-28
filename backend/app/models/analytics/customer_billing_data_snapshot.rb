module Analytics
  class CustomerBillingDataSnapshot < ApplicationRecord
    belongs_to :workspace
    belongs_to :owner, polymorphic: true, optional: true
  end
end