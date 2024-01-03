class AnalyticsOrganizationMember < Transactional
  belongs_to :analytics_organization_profile
  alias_attribute :organization, :analytics_organization_profile
  belongs_to :analytics_user_profile
  alias_attribute :user, :analytics_user_profile

  validates_uniqueness_of :analytics_organization_profile_id, scope: :analytics_user_profile_id

  after_create :enqueue_replication_to_clickhouse
  # one day we should handle destroys here too

  private

  def enqueue_replication_to_clickhouse
    Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.CLICKHOUSE_ORGANIZATION_MEMBERS, {
      workspace_id: organization.workspace_id,
      swishjam_api_key: organization.workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key,
      swishjam_organization_id: analytics_organization_profile_id,
      swishjam_user_id: analytics_user_profile_id,
      created_at: created_at,
    })
  end
end