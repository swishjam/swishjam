class AnalyticsOrganizationProfileUser < Transactional
  self.table_name = :analytics_organization_profiles_users
  belongs_to :analytics_organization_profile
  alias_attribute :organization, :analytics_organization_profile
  belongs_to :analytics_user_profile
  alias_attribute :user, :analytics_user_profile

  validates_uniqueness_of :analytics_organization_profile_unique_identifier, scope: :analytics_user_profile_unique_identifier
  validate :validate_workspace_id

  after_create :enqueue_into_clickhouse_replication_data
  # one day we should handle destroys here too

  private

  def enqueue_into_clickhouse_replication_data
    Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.CLICKHOUSE_USER_ORGANIZATION_RELATIONSHIP, {
      workspace_id: organization.workspace_id,
      swishjam_api_key: organization.workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key,
      swishjam_organization_id: analytics_organization_profile_id,
      swishjam_user_id: analytics_user_profile_id,
      created_at: created_at,
    })
  end


  def validate_workspace_id
    # if analytics_organization_profile.workspace_id != analytics_user_profile.workspace_id
    #   errors.add(:analytics_organization_profile, "workspace_id does not match analytics_user_profile.workspace_id")
    # end
  end
end