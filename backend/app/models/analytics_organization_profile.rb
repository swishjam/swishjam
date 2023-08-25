class AnalyticsOrganizationProfile < Transactional
  belongs_to :workspace
  has_many :analytics_organization_profile_users, dependent: :destroy
  has_many :analytics_user_profiles, through: :analytics_organization_profile_users
end