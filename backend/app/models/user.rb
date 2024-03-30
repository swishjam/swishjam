class User < Transactional
  has_secure_password

  has_many :auth_sessions, dependent: :destroy
  has_many :created_cohorts, class_name: Cohort.to_s, foreign_key: :created_by_user_id, dependent: :destroy
  has_many :workspace_members, dependent: :destroy
  has_many :workspaces, through: :workspace_members, dependent: :destroy

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP, message: "Must be a valid email address." }
  validates :password, presence: true, length: { minimum: 8 }
  validates :jwt_secret_key, presence: true, uniqueness: true

  before_validation :generate_jwt_secret_key, on: :create

  def full_name
    return nil if first_name.blank? && last_name.blank?
    (first_name || '') + (last_name || '')
  end

  private

  def generate_jwt_secret_key
    self.jwt_secret_key = SecureRandom.hex(16)
  end
end