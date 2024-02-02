class AnalyticsUserProfileDevice < Transactional
  belongs_to :analytics_user_profile
  belongs_to :workspace

  validates_uniqueness_of :swishjam_cookie_value, scope: :workspace_id
  validates_uniqueness_of :device_fingerprint, scope: :workspace_id, allow_nil: true

  def owner
    analytics_user_profile
  end
end