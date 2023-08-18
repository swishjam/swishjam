module Analytics
  class BillingDataSnapshot < ApplicationRecord
    self.table_name = :analytics_billing_data_snapshots
    belongs_to :swishjam_organization, class_name: Swishjam::Organization.to_s, foreign_key: :swishjam_organization_id

    validates :mrr_in_cents, presence: true
    validates :total_revenue_in_cents, presence: true
    validates :num_active_subscriptions, presence: true
    validates :num_free_trial_subscriptions, presence: true
    validates :num_canceled_subscriptions, presence: true
  end
end