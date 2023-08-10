class User < ApplicationRecord
  has_secure_password

  has_many :sessions
  has_many :organization_users
  has_many :organizations, through: :organization_users

  validates :email, presence: true, uniqueness: true
  validates :password, presence: true
  validates :jwt_secret_key, presence: true, uniqueness: true

  before_create :generate_jwt_secret_key

  private

  def generate_jwt_secret_key
    self.jwt_secret_key = SecureRandom.hex(16)
  end
end