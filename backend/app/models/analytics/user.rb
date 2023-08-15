module Analytics
  class User < ApplicationRecord
    self.table_name = :analytics_users
    belongs_to :swishjam_organization, class_name: Swishjam::Organization.to_s, foreign_key: :swishjam_organization_id
    belongs_to :organization, class_name: Analytics::Organization.to_s, foreign_key: :analytics_organization_id, optional: true
    has_many :devices, class_name: Analytics::Device.to_s, foreign_key: :analytics_user_id, dependent: :destroy
    has_many :sessions, class_name: Analytics::Session.to_s, foreign_key: :analytics_user_id, dependent: :destroy
    has_many :page_hits, class_name: Analytics::PageHit.to_s, foreign_key: :analytics_user_id, dependent: :destroy
    has_many :events, class_name: Analytics::Event.to_s, foreign_key: :analytics_user_id, dependent: :destroy
    has_many :metadata, as: :parent, class_name: Analytics::Metadata.to_s, dependent: :destroy
    accepts_nested_attributes_for :metadata
  end
end