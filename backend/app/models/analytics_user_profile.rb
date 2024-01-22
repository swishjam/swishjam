class AnalyticsUserProfile < Transactional
  belongs_to :workspace
  has_one :user_profile_enrichment_data, class_name: UserProfileEnrichmentData.to_s, dependent: :destroy
  alias_attribute :enrichment_data, :user_profile_enrichment_data

  has_many :analytics_user_profile_devices, dependent: :destroy
  has_many :analytics_organization_members, dependent: :destroy
  has_many :analytics_organization_profiles, through: :analytics_organization_members
  alias_attribute :organizations, :analytics_organization_profiles
  has_many :customer_subscriptions, as: :parent_profile, dependent: :destroy

  validates :user_unique_identifier, uniqueness: { scope: :workspace_id }, if: -> { user_unique_identifier.present? }

  scope :anonymous, -> { where(user_unique_identifier: nil, email: nil) }
  scope :identified, -> { where.not(user_unique_identifier: nil).or(where.not(email: nil)) }

  # after_create :try_to_set_gravatar_url
  before_create :try_to_set_gravatar_url
  after_create :enrich_profile!
  after_create :enqueue_replication_to_clickhouse
  after_update :enqueue_replication_to_clickhouse

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
    return nil if first_name.blank? || last_name.blank?
    "#{first_name} #{last_name}"
  end

  def initials
    return (email || '')[0]&.upcase if first_name.blank? && last_name.blank?
    return first_name[0].upcase if last_name.blank?
    return last_name[0].upcase if first_name.blank?
    "#{first_name[0]}#{last_name[0]}".upcase
  end

  def enrich_profile!(override_sampling: false)
    return false if override_sampling == false && rand() >= (ENV['USER_ENRICHMENT_SAMPLING_RATE'] || 1.0).to_f
    ProfileEnrichers::User.new(self).try_to_enrich_profile_if_necessary!
  rescue => e
    Sentry.capture_exception(e)
  end

  def try_to_set_gravatar_url
    return unless email.present?
    url = "https://www.gravatar.com/avatar/#{Digest::MD5.hexdigest(email.downcase)}?d=404"
    response = HTTParty.get(url)
    return unless response.code == 200
    self.gravatar_url = url
    # update_column :gravatar_url, url
  end

  def enqueue_replication_to_clickhouse
    Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.CLICKHOUSE_USER_PROFILES, formatted_for_clickhouse_replication)
  end

  private

  def formatted_for_clickhouse_replication
    {
      workspace_id: workspace_id,
      swishjam_user_id: id,
      swishjam_api_key: workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key,
      user_unique_identifier: user_unique_identifier,
      email: email,
      merged_into_swishjam_user_id: merged_into_analytics_user_profile_id,
      gravatar_url: gravatar_url,
      lifetime_value_in_cents: lifetime_value_in_cents,
      monthly_recurring_revenue_in_cents: customer_subscriptions.active.sum{ |sub| StripeHelpers::MrrCalculator.calculate_for_swishjam_subscription_record(sub) },
      current_subscription_plan_name: customer_subscriptions.active.not_canceled.map{ |sub| sub.customer_subscription_items.map(&:product_name) }.flatten.join(', '),
      created_by_data_source: created_by_data_source,
      metadata: (metadata || {}).to_json,
      first_seen_at_in_web_app: first_seen_at_in_web_app,
      last_seen_at_in_web_app: last_seen_at_in_web_app,
      created_at: created_at,
      updated_at: updated_at,
      last_updated_from_transactional_db_at: Time.current,
    }
  end
end