class AnalyticsUserProfile < Transactional
  belongs_to :workspace
  has_one :user_profile_enrichment_data, class_name: UserProfileEnrichmentData.to_s, dependent: :destroy
  alias_attribute :enrichment_data, :user_profile_enrichment_data
  has_many :analytics_organization_profile_users, dependent: :destroy
  has_many :analytics_organization_profiles, through: :analytics_organization_profile_users
  has_many :customer_subscriptions, as: :parent_profile, dependent: :destroy

  validates :user_unique_identifier, uniqueness: { scope: :workspace_id }, if: -> { user_unique_identifier.present? }

  # after_create :try_to_set_gravatar_url
  before_create :try_to_set_gravatar_url
  after_create :enrich_profile!
  after_create :enqueue_into_clickhouse_replication_data
  after_update :enqueue_into_clickhouse_replication_data

  def self.find_by_case_insensitive_email(email)
    where("lower(email) = ?", email.downcase).first
  end

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

  def enqueue_into_clickhouse_replication_data
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
      first_name: first_name,
      last_name: last_name,
      full_name: full_name,
      gravatar_url: gravatar_url,
      initial_landing_page_url: initial_landing_page_url,
      initial_referrer_url: initial_referrer_url,
      lifetime_value_in_cents: lifetime_value_in_cents,
      monthly_recurring_revenue_in_cents: customer_subscriptions.active.sum{ |sub| StripeHelpers::MrrCalculator.calculate_for_swishjam_subscription_record(sub) },
      current_subscription_plan_name: customer_subscriptions.active.not_canceled.map{ |sub| sub.customer_subscription_items.map(&:product_name) }.flatten.join(', '),
      created_by_data_source: created_by_data_source,
      metadata: (immutable_metadata || {}).merge(metadata || {}).to_json,
      enrichment_match_likelihood: enrichment_data&.match_likelihood,
      enrichment_first_name: enrichment_data&.first_name,
      enrichment_last_name: enrichment_data&.last_name,
      enrichment_linkedin_url: enrichment_data&.linkedin_url,
      enrichment_twitter_url: enrichment_data&.twitter_url,
      enrichment_github_url: enrichment_data&.github_url,
      enrichment_personal_email: enrichment_data&.personal_email,
      enrichment_industry: enrichment_data&.industry,
      enrichment_job_title: enrichment_data&.job_title,
      enrichment_company_name: enrichment_data&.company_name,
      enrichment_company_website: enrichment_data&.company_website,
      enrichment_company_size: enrichment_data&.company_size,
      enrichment_year_company_founded: enrichment_data&.year_company_founded,
      enrichment_company_industry: enrichment_data&.company_industry,
      enrichment_company_linkedin_url: enrichment_data&.company_linkedin_url,
      enrichment_company_twitter_url: enrichment_data&.company_twitter_url,
      enrichment_company_location_metro: enrichment_data&.company_location_metro,
      enrichment_company_location_geo_coordinates: enrichment_data&.company_location_geo_coordinates,
      first_seen_at_in_web_app: first_seen_at_in_web_app,
      created_at: created_at,
      updated_at: updated_at,
      last_updated_from_transactional_db_at: Time.current,
    }
  end
end