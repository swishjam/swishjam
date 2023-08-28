class AnalyticsOrganizationProfileUser < Transactional
  self.table_name = :analytics_organization_profiles_users
  belongs_to :analytics_organization_profile
  belongs_to :analytics_user_profile

  validates_uniqueness_of :analytics_organization_profile_id, scope: :analytics_user_profile_id
  # validate the workspace_id of the analytics_organization_profile and analytics_user_profile are the same
  validate :validate_workspace_id

  private

  def validate_workspace_id
    if analytics_organization_profile.workspace_id != analytics_user_profile.workspace_id
      errors.add(:analytics_organization_profile, "workspace_id does not match analytics_user_profile.workspace_id")
    end
  end
end