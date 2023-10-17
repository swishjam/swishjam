class AnalyticsUserProfile < Transactional
  belongs_to :workspace
  has_one :user_profile_enrichment_data, class_name: UserProfileEnrichmentData.to_s, dependent: :destroy
  alias_attribute :enrichment_data, :user_profile_enrichment_data
  has_many :analytics_organization_profile_users, dependent: :destroy
  has_many :analytics_organization_profiles, through: :analytics_organization_profile_users

  validates :user_unique_identifier, presence: true, uniqueness: { scope: :workspace_id }

  after_create { ProfileEnrichers::User.new(self).try_to_enrich_profile_if_necessary! }

  def full_name
    "#{first_name} #{last_name}"
  end

  def initials
    return (email || '')[0] if first_name.blank? && last_name.blank?
    return first_name[0].upcase if last_name.blank?
    return last_name[0].upcase if first_name.blank?
    "#{first_name[0]}#{last_name[0]}".upcase
  end
end