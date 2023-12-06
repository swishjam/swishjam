class CustomerSubscription < Transactional
  belongs_to :workspace
  belongs_to :parent_profile, polymorphic: true
  has_many :customer_subscription_items, dependent: :destroy

  %i[active trialing canceled past_due unpaid incomplete incomplete_expired].each do |status|
    define_method("#{status}?") do
      self.status == status.to_s
    end

    scope status, -> { where(status: status.to_s) }
  end

  validates :workspace_id, presence: true
  validates :parent_profile_id, presence: true
  validates :parent_profile_type, presence: true
  validates :subscription_provider_object_id, presence: true, uniqueness: { scope: [:workspace_id, :subscription_provider] }
  validates :subscription_provider, presence: true
  validates :status, presence: true

  def self.find_by_provider_object_id!(provider_object_id)
    find_by!(subscription_provider_object_id: provider_object_id)
  end

  def self.find_by_provider_object_id(provider_object_id)
    find_by(subscription_provider_object_id: provider_object_id)
  end
end