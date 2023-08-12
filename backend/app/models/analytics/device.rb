module Analytics
  class Device < ApplicationRecord
    self.table_name = :analytics_devices
    belongs_to :swishjam_organization, class_name: Swishjam::Organization.to_s
    belongs_to :user, optional: true, class_name: Analytics::User.to_s, foreign_key: :analytics_user_id
    has_many :sessions, class_name: Analytics::Session.to_s, dependent: :destroy
    has_many :page_hits, class_name: Analytics::PageHit.to_s, dependent: :destroy
    has_many :events, class_name: Analytics::Event.to_s, dependent: :destroy
  end
end