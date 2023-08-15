module Swishjam
  class User < ApplicationRecord
    self.table_name = :swishjam_users
    has_secure_password

    has_many :sessions, class_name: Swishjam::Session.to_s, foreign_key: :swishjam_user_id, dependent: :destroy
    has_many :organization_users, class_name: Swishjam::OrganizationUser.to_s, foreign_key: :swishjam_user_id, dependent: :destroy, dependent: :destroy
    has_many :organizations, class_name: Swishjam::Organization.to_s, through: :organization_users, dependent: :destroy

    validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP, message: "Must be a valid email address." }
    validates :password, presence: true, length: { minimum: 8 }
    validates :jwt_secret_key, presence: true, uniqueness: true

    before_validation :generate_jwt_secret_key, on: :create

    private

    def generate_jwt_secret_key
      self.jwt_secret_key = SecureRandom.hex(16)
    end
  end
end