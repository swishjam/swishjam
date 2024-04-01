class Workspace < Transactional
  has_many :analytics_user_profiles, dependent: :destroy
  has_many :analytics_user_profile_devices, dependent: :destroy
  has_many :analytics_organization_profiles, dependent: :destroy
  has_many :api_keys, dependent: :destroy
  has_many :automations, dependent: :destroy
  has_many :automation_steps, through: :automations
  has_many :entry_point_automation_steps, through: :automations
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
  has_many :user_segments, dependent: :destroy

  after_create_commit { ApiKey.generate_default_keys_for(self) }
  after_create_commit { WorkspaceSetting.generate_default_for(self) }
  after_create_commit { UserSegment.create_default_for_workspace(self) }
  after_create :add_swishjam_admin_to_workspace
  attribute :public_key, :string, default: "DEPRECATED"

  attribute :should_enrich_user_profile_data, :boolean, default: false
  alias_attribute :should_enrich_user_profile_data?, :should_enrich_user_profile_data

  def self.for_public_key!(public_key)
    ApiKey.enabled.find_by!(public_key: public_key).workspace
  end

  def self.for_public_key(public_key)
    ApiKey.enabled.find_by(public_key: public_key)&.workspace
  end

  def non_hidden_users
    users.where(workspace_members: { is_hidden: false })
  end

  private

  def add_swishjam_admin_to_workspace
    admin_user_ids = ENV['SWISHJAM_ADMIN_USER_IDS'] || "b4320d6e-5faf-488b-bef1-a471593c7ac8, e672d646-872e-41ed-b49b-d8ef0230fdb5".split(',').map(&:strip)
    admin_users = User.where(id: admin_user_ids)
    admin_users.each do |user|
      workspace_members.create(user: user, is_hidden: true)
    end
  end
end