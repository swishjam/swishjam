class AnalyticsUserProfileDeviceHistoricalOwner < Transactional
  belongs_to :analytics_user_profile_device
  belongs_to :analytics_user_profile
end