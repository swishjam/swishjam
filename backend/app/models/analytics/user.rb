module Analytics
  class User < ApplicationRecord
    self.table_name = :analytics_users
    belongs_to :swishjam_organization, class_name: Swishjam::Organization.to_s, foreign_key: :swishjam_organization_id
    has_many :organization_users, class_name: Analytics::OrganizationUser.to_s, foreign_key: :analytics_user_id, dependent: :destroy
    has_many :organizations, through: :organization_users, class_name: Analytics::Organization.to_s, source: :analytics_organization, source: :organization
    has_many :devices, class_name: Analytics::Device.to_s, foreign_key: :analytics_user_id, dependent: :destroy
    has_many :sessions, class_name: Analytics::Session.to_s, through: :devices, dependent: :destroy
    has_many :metadata, as: :parent, class_name: Analytics::Metadata.to_s, dependent: :destroy
    accepts_nested_attributes_for :metadata

    def full_name
      "#{first_name} #{last_name}"
    end
  end
end