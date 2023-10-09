class Workspace < Transactional
  has_many :analytics_user_profiles, dependent: :destroy
  has_many :analytics_organization_profiles, dependent: :destroy
  has_many :api_keys, dependent: :destroy
  has_many :data_syncs, dependent: :destroy
  has_many :integrations, dependent: :destroy
  has_many :retention_cohorts
  has_many :retention_cohort_activity_periods, through: :retention_cohorts
  has_many :users, through: :workspace_members
  has_many :workspace_members, dependent: :destroy

  after_create_commit { ApiKey.generate_default_keys_for(self) }
  attribute :public_key, :string, default: "DEPRECATED"
end