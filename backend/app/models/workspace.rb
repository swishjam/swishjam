class Workspace < Transactional
  has_many :analytics_user_profiles, dependent: :destroy
  has_many :analytics_user_profile_devices, dependent: :destroy
  has_many :analytics_organization_profiles, dependent: :destroy
  has_many :api_keys, dependent: :destroy
  has_many :customer_subscriptions, dependent: :destroy
  has_many :customer_subscription_items, through: :customer_subscriptions
  has_many :dashboards, dependent: :destroy
  has_many :dashboard_components, through: :dashboards
  has_many :data_syncs, dependent: :destroy
  has_many :do_not_enrich_user_profile_rules, dependent: :destroy
  has_many :event_triggers, dependent: :destroy
  has_many :integrations, dependent: :destroy
  has_many :reports, dependent: :destroy
  has_many :retention_cohorts, dependent: :destroy
  has_many :retention_cohort_activity_periods, through: :retention_cohorts
  has_one :settings, class_name: WorkspaceSetting.to_s, dependent: :destroy
  has_many :workspace_invitations, dependent: :destroy
  has_many :workspace_members, dependent: :destroy
  has_many :users, through: :workspace_members

  after_create_commit { ApiKey.generate_default_keys_for(self) }
  after_create_commit { WorkspaceSetting.generate_default_for(self) }
  attribute :public_key, :string, default: "DEPRECATED"

  attribute :should_enrich_user_profile_data, :boolean, default: false
  alias_attribute :should_enrich_user_profile_data?, :should_enrich_user_profile_data

  def self.for_public_key!(public_key)
    ApiKey.enabled.find_by!(public_key: public_key).workspace
  end

  def self.for_public_key(public_key)
    ApiKey.enabled.find_by(public_key: public_key)&.workspace
  end
end