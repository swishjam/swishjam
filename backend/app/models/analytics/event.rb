module Analytics
  class Event < ClickHouseRecord
    class ReservedNames
      class << self
        METHOD_NAMES = [:PAGE_VIEW, :PAGE_LEFT]
        
        METHOD_NAMES.each do |property_name|
          define_method(property_name) do
            property_name.to_s.downcase
          end
        end

        def all
          METHOD_NAMES.collect{ |method_name| self.send(method_name) }
        end
      end
    end

    class ReservedPropertyNames
      class << self
        METHOD_NAMES = [:SESSION_IDENTIFIER, :DEVICE_IDENTIFIER, :SWISHJAM_ORGANIZATION_ID]

        METHOD_NAMES.each do |property_name|
          define_method(property_name) do
            property_name.to_s.downcase
          end
        end
        
        def all
          METHOD_NAMES.collect{ |method_name| self.send(method_name) }
        end
      end
    end

    has_many :user_identify_events, foreign_key: :user_distinct_id, primary_key: :user_distinct_id

    attribute :properties, :json, default: {}
    attribute :ingested_at, :datetime, default: -> { Time.current }
    before_create { self.name = self.class.normalized_event_name(name) }

    validates :name, presence: true
    validates :swishjam_api_key, presence: true

    scope :by_api_key, -> (api_key) { where(swishjam_api_key: api_key) }
    scope :by_name, -> (name) { where(name: normalized_event_name(name)) }

    def self.PAGE_VIEWS
      by_name(ReservedNames.PAGE_VIEW)
    end
    
    def self.normalized_event_name(event_name)
      event_name.downcase.gsub(/[^a-z0-9]/, '_')
    end
  end
end