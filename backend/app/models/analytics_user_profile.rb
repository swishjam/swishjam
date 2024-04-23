class AnalyticsUserProfile < Transactional
  class ReservedMetadataProperties
    class << self
      PROPERTY_NAMES = %i[
        INITIAL_LANDING_PAGE_URL
        INITIAL_LANDING_PAGE_URL_HOST
        INITIAL_LANDING_PAGE_URL_PATH
        INITIAL_LANDING_PAGE_URL_QUERY_PARAMS
        INITIAL_LANDING_PAGE_BASE_URL
         
        INITIAL_REFERRER
        INITIAL_REFERRER_URL
        INITIAL_REFERRER_URL_HOST
        INITIAL_REFERRER_URL_PATH
        INITIAL_REFERRER_URL_QUERY_PARAMS
        INITIAL_REFERRER_BASE_URL
         
        INITIAL_UTM_CAMPAIGN
        INITIAL_UTM_CONTENT
        INITIAL_UTM_MEDIUM
        INITIAL_UTM_SOURCE
        INITIAL_UTM_TERM
        INITIAL_GCLID
        GRAVATAR_URL
      ]
      
      def all
        PROPERTY_NAMES
      end

      PROPERTY_NAMES.each do |property_name|
        define_method(property_name) do
          property_name.to_s.downcase
        end
      end
    end
  end
  include JsonbMethods

  belongs_to :workspace
  has_one :enriched_data, as: :enrichable, dependent: :destroy
  alias_attribute :enrichment_data, :enriched_data

  has_many :analytics_user_profile_devices, dependent: :destroy
  has_many :analytics_organization_members, dependent: :destroy
  has_many :analytics_organization_profiles, through: :analytics_organization_members
  alias_attribute :organizations, :analytics_organization_profiles
  has_many :customer_subscriptions, as: :parent_profile, dependent: :destroy
  has_many :enrichment_attempts, as: :enrichable, dependent: :destroy
  has_many :profile_tags, as: :profile, dependent: :destroy
  alias_attribute :tags, :profile_tags

  attribute :metadata, :jsonb, default: {}
  self.define_jsonb_methods :metadata, ReservedMetadataProperties.all

  validates :user_unique_identifier, uniqueness: { scope: :workspace_id }, if: -> { user_unique_identifier.present? }

  scope :anonymous, -> { where(user_unique_identifier: nil, email: nil) }
  scope :identified, -> { where.not(user_unique_identifier: nil).or(where.not(email: nil)) }
  scope :with_active_profile_tag, ->(tag_name) { joins(:profile_tags).where(profile_tags: { name: tag_name, removed_at: nil }) }
  scope :has_metadata_key, ->(key) { where("metadata ? :key", key: key) }

  before_create :try_to_set_gravatar_url
  after_create :enrich_profile!
  after_create :enqueue_replication_to_clickhouse
  after_update :enqueue_replication_to_clickhouse

  ReservedMetadataProperties.all.each do |property_name|
    define_method(property_name.to_s.downcase) do
      metadata[property_name.to_s.downcase]
    end
  end

  def self.find_by_case_insensitive_email(email)
    where("lower(email) = ?", email.downcase).first
  end

  def anonymous?
    user_unique_identifier.blank?
  end
  alias is_anonymous? anonymous?
  alias anonymous anonymous?
  alias is_anonymous anonymous?

  def full_name
    if first_name.blank? || last_name.blank?
      metadata['name'] || metadata['fullName'] || metadata['full_name']
    else
      "#{first_name} #{last_name}"
    end
  end

  def first_name
    metadata['firstName'] || metadata['first_name']
  end

  def last_name
    metadata['lastName'] || metadata['last_name']
  end

  def initials
    return (email || '')[0]&.upcase if first_name.blank? && last_name.blank?
    return first_name[0].upcase if last_name.blank?
    return last_name[0].upcase if first_name.blank?
    "#{first_name[0]}#{last_name[0]}".upcase
  end

  def email_domain
    return nil if email.blank?
    email.split('@').last
  end

  def enrich_profile!
    # return false if override_sampling == false && rand() >= (ENV['USER_ENRICHMENT_SAMPLING_RATE'] || 1.0).to_f
    ProfileEnrichers::User.new(self, enricher: workspace.settings.enrichment_provider).try_to_enrich_profile_if_necessary!
  rescue => e
    Sentry.capture_exception(e)
  end

  def try_to_set_gravatar_url
    return unless email.present?
    url = "https://www.gravatar.com/avatar/#{Digest::MD5.hexdigest(email.downcase)}?d=404"
    response = HTTParty.get(url)
    return unless response.code == 200
    self.metadata.merge!(gravatar_url: url)
  end

  def enqueue_replication_to_clickhouse
    Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.CLICK_HOUSE_USER_PROFILES, self.reload.formatted_for_clickhouse_replication)
  end
  
  def formatted_for_clickhouse_replication
    {
      workspace_id: workspace_id,
      swishjam_user_id: id,
      user_unique_identifier: user_unique_identifier,
      email: email,
      merged_into_swishjam_user_id: merged_into_analytics_user_profile_id,
      created_by_data_source: created_by_data_source,
      metadata: metadata.merge(
        enriched_data.nil? ? {} : Hash.new.tap{ |h| enriched_data.data.each{ |k, v| h["enriched_#{k}"] = v }}
      ).to_json,
      first_seen_at_in_web_app: first_seen_at_in_web_app,
      last_seen_at_in_web_app: last_seen_at_in_web_app,
      created_at: created_at,
      updated_at: updated_at,
      last_updated_from_transactional_db_at: Time.current,
    }
  end
end