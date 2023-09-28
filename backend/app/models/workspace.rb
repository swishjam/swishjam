class Workspace < Transactional
  has_many :api_keys, dependent: :destroy
  has_many :workspace_members, dependent: :destroy
  has_many :users, through: :workspace_members
  has_many :integrations, dependent: :destroy
  has_many :data_syncs, dependent: :destroy
  has_many :analytics_user_profiles, dependent: :destroy
  has_many :analytics_organization_profiles, dependent: :destroy

  after_create_commit { ApiKey.generate_default_keys_for(self) }
end