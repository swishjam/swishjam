class Workspace < Transactional
  has_many :workspace_members, dependent: :destroy
  has_many :users, through: :workspace_members
  has_many :integrations
  has_many :data_syncs
  has_many :url_segments
  has_many :analytics_user_profiles
  has_many :analytics_organization_profiles

  validates :public_key, presence: true, uniqueness: true
  before_validation :generate_public_key, on: :create

  private

  def generate_public_key
    key = ['swishjam', SecureRandom.hex(4), SecureRandom.hex(4)].join('-')
    if Workspace.exists?(public_key: key)
      generate_public_key
    else
      self.public_key = key
    end
  end
end