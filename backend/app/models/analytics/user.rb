module Analytics
  class User < ApplicationRecord
    self.table_name = :analytics_users
    belongs_to :instance
    belongs_to :organization, class_name: Analytics::Organization.to_s, optional: true
    has_many :devices, class_name: Analytics::Device.to_s, dependent: :destroy
    has_many :sessions, class_name: Analytics::Session.to_s, dependent: :destroy
    has_many :page_hits, class_name: Analytics::PageHit.to_s, dependent: :destroy
    has_many :events, class_name: Analytics::Event.to_s, dependent: :destroy
    has_many :metadata, as: :parent, class_name: Analytics::Metadata.to_s, dependent: :destroy
    accepts_nested_attributes_for :metadata
  end
end