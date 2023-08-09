module Analytics
  class Event < ApplicationRecord
    self.table_name = :analytics_events
    belongs_to :device, class_name: Analytics::Device.to_s
    belongs_to :session, class_name: Analytics::Session.to_s
    belongs_to :page_hit, class_name: Analytics::PageHit.to_s
    has_many :metadata, as: :parent, class_name: Analytics::Metadata.to_s, dependent: :destroy
    accepts_nested_attributes_for :metadata

    scope :for_instance, -> (instance) { joins(:device).where(devices: { instance_id: instance.id }) }

    def formatted_metadata
      Hash.new.tap do |hash|
        metadata.each{ |meta| hash[meta.key] = meta.value }
      end.with_indifferent_access
    end
  end
end