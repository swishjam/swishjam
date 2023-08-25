module Analytics
  class BillingDataSnapshot < ApplicationRecord
    self.table_name = :analytics_billing_data_snapshots
    belongs_to :swishjam_organization, class_name: Workspace.to_s, foreign_key: :swishjam_organization_id

    validates :mrr_in_cents, presence: true
    validates :total_revenue_in_cents, presence: true
    validates :num_active_subscriptions, presence: true
    validates :num_free_trial_subscriptions, presence: true
    validates :num_canceled_subscriptions, presence: true

    scope :captured_after, ->(timestamp) { where('captured_at > ?', timestamp) }
    scope :captured_at_or_after, ->(timestamp) { where('captured_at >= ?', timestamp) }
    scope :captured_before, ->(timestamp) { where('captured_at < ?', timestamp) }
    scope :captured_at_or_before, ->(timestamp) { where('captured_at <= ?', timestamp) }
  end
end