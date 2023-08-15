module Analytics
  class Event < ApplicationRecord
    self.table_name = :analytics_events
    belongs_to :device, class_name: Analytics::Device.to_s, foreign_key: :analytics_device_id
    belongs_to :session, class_name: Analytics::Session.to_s, foreign_key: :analytics_session_id
    belongs_to :page_hit, class_name: Analytics::PageHit.to_s, foreign_key: :analytics_page_hit_id
    has_many :metadata, as: :parent, class_name: Analytics::Metadata.to_s, dependent: :destroy
    accepts_nested_attributes_for :metadata

    scope :for_user, -> (user) { joins(:device).where(analytics_devices: { analytics_user_id: user.id }) }
    scope :for_organization, -> (organization) { joins(:session).where(analytics_sessions: { analytics_organization_id: organization.id }) }

    def formatted_metadata
      Hash.new.tap do |hash|
        metadata.each{ |meta| hash[meta.key] = meta.value }
      end.with_indifferent_access
    end
  end
end