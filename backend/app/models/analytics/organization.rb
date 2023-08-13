module Analytics
  class Organization < ApplicationRecord
    self.table_name = :analytics_organizations
    belongs_to :swishjam_organization, class_name: Swishjam::Organization.to_s, foreign_key: :swishjam_organization_id
    has_many :organization_users, class_name: Analytics::OrganizationUser.to_s, foreign_key: :analytics_organization_id, dependent: :destroy
    has_many :users, through: :organization_users, class_name: Analytics::User.to_s, source: :analytics_user
    has_many :sessions, class_name: Analytics::Session.to_s, foreign_key: :analytics_organization_id, dependent: :destroy
    has_many :page_hits, class_name: Analytics::PageHit.to_s, foreign_key: :analytics_organization_id, dependent: :destroy
  end
end