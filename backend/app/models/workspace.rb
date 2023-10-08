class Workspace < Transactional
  has_many :api_keys, dependent: :destroy
  has_many :workspace_members, dependent: :destroy
  has_many :users, through: :workspace_members
  has_many :integrations, dependent: :destroy
  has_many :data_syncs, dependent: :destroy
  has_many :analytics_user_profiles, dependent: :destroy
  has_many :analytics_organization_profiles, dependent: :destroy
  has_many :dashboards, dependent: :destroy
  has_many :dashboard_components, through: :dashboards

  after_create_commit { ApiKey.generate_default_keys_for(self) }
  attribute :public_key, :string, default: "DEPRECATED"

  def public_key
    raise "`public_key` is deprecated, please use the workspace's `api_keys`."
  end
end