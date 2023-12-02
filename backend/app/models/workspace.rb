class Workspace < Transactional
  has_many :analytics_user_profiles, dependent: :destroy
  has_many :analytics_organization_profiles, dependent: :destroy
  has_many :api_keys, dependent: :destroy
  has_many :dashboards, dependent: :destroy
  has_many :dashboard_components, through: :dashboards
  has_many :event_triggers, dependent: :destroy
  has_many :data_syncs, dependent: :destroy
  has_many :integrations, dependent: :destroy
  has_many :retention_cohorts, dependent: :destroy
  has_many :retention_cohort_activity_periods, through: :retention_cohorts
  has_one :settings, class_name: WorkspaceSetting.to_s, dependent: :destroy
  has_one :slack_connection, dependent: :destroy
  has_many :workspace_invitations, dependent: :destroy
  has_many :workspace_members, dependent: :destroy
  has_many :users, through: :workspace_members
  has_many :reports, through: :reports

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