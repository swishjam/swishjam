class AnalyticsOrganizationProfile < Transactional
  belongs_to :workspace
  has_one :enriched_data, as: :enrichable, dependent: :destroy
  alias_attribute :enrichment_data, :enriched_data

  has_many :analytics_organization_members, dependent: :destroy
  has_many :analytics_user_profiles, through: :analytics_organization_members
  alias_attribute :users, :analytics_user_profiles
  has_many :enrichment_attempts, as: :enrichable, dependent: :destroy
  has_many :profile_tags, as: :profile, dependent: :destroy
  alias_attribute :tags, :profile_tags

  after_create :enrich_profile!
  after_create :enqueue_replication_to_clickhouse
  after_update :enqueue_replication_to_clickhouse

  attribute :metadata, :jsonb, default: {}

  def initials
    return if name.blank?
    name.split(' ').map{ |word| word[0] }.join('').upcase
  end

  def enrich_profile!
    ProfileEnrichers::Organization.new(self, enricher: workspace.settings.enrichment_provider).try_to_enrich_profile_if_necessary!
  rescue => e
    Sentry.capture_exception(e)
  end

  def enqueue_replication_to_clickhouse
    Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.CLICK_HOUSE_ORGANIZATION_PROFILES, self.reload.formatted_for_clickhouse_replication)
  end

  def formatted_for_clickhouse_replication
    {
      workspace_id: workspace_id,
      swishjam_organization_id: id,
      organization_unique_identifier: organization_unique_identifier,
      name: name,
      domain: domain,
      metadata: metadata.merge(
        enriched_data.nil? ? {} : Hash.new.tap{ |h| enriched_data.data.each{ |k, v| h["enriched_#{k}"] = v }}
      ).to_json,
      last_updated_from_transactional_db_at: Time.current,
      created_at: created_at,
      updated_at: updated_at,
    }
  end
end