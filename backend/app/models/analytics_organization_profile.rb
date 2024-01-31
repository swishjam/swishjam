class AnalyticsOrganizationProfile < Transactional
  belongs_to :workspace
  has_many :analytics_organization_members, dependent: :destroy
  has_many :analytics_user_profiles, through: :analytics_organization_members
  alias_attribute :users, :analytics_user_profiles

  attribute :metadata, :jsonb, default: {}

  after_create :enqueue_replication_to_clickhouse
  after_update :enqueue_replication_to_clickhouse

  def initials
    return if name.blank?
    name.split(' ').map{ |word| word[0] }.join('').upcase
  end

  def enqueue_replication_to_clickhouse
    Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.CLICK_HOUSE_ORGANIZATION_PROFILES, formatted_for_clickhouse_replication)
  end

  def formatted_for_clickhouse_replication
    {
      workspace_id: workspace_id,
      swishjam_organization_id: id,
      organization_unique_identifier: organization_unique_identifier,
      name: name,
      domain: domain,
      metadata: metadata.to_json,
      last_updated_from_transactional_db_at: Time.current,
      created_at: created_at,
      updated_at: updated_at,
    }
  end
end