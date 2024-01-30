class AnalyticsUserProfileDevice < Transactional
  belongs_to :analytics_user_profile
  belongs_to :workspace

  def owner
    analytics_user_profile
  end
end