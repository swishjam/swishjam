module Analytics
  class Organization < ApplicationRecord
    self.table_name = :analytics_organizations
    belongs_to :swishjam_organization, class_name: Swishjam::Organization.to_s
    has_many :users, class_name: Analytics::User.to_s, dependent: :destroy
    has_many :sessions, class_name: Analytics::Session.to_s, dependent: :destroy
    has_many :page_hits, class_name: Analytics::PageHit.to_s, dependent: :destroy
  end
end