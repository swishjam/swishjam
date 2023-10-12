class Workspace < Transactional
  has_many :analytics_user_profiles, dependent: :destroy
  has_many :analytics_organization_profiles, dependent: :destroy
  has_many :api_keys, dependent: :destroy
  has_many :dashboards, dependent: :destroy
  has_many :dashboard_components, through: :dashboards
  has_many :data_syncs, dependent: :destroy
  has_many :integrations, dependent: :destroy
  has_many :retention_cohorts, dependent: :destroy
  has_many :retention_cohort_activity_periods, through: :retention_cohorts
  has_many :users, through: :workspace_members
  has_many :workspace_members, dependent: :destroy
  has_one :settings, class_name: WorkspaceSetting.to_s, dependent: :destroy

  after_create_commit { ApiKey.generate_default_keys_for(self) }
  after_create_commit { WorkspaceSetting.generate_default_for(self) }
  attribute :public_key, :string, default: "DEPRECATED"

  # def public_key
  #   raise "`public_key` is deprecated, please use the workspace's `api_keys`."
  # end
end