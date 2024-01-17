class AnalyticsUserProfileDevice < Transactional
  belongs_to :analytics_user_profile
  belongs_to :workspace
  has_many :analytics_user_profile_device_historical_owners, dependent: :destroy
end