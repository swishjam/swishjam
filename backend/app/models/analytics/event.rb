module Analytics
  class Event < ClickHouseRecord
    class ReservedNames
      class << self
        METHOD_NAMES = %i[PAGE_VIEW PAGE_LEFT NEW_SESSION]
        
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
        METHOD_NAMES = %i[SESSION_IDENTIFIER DEVICE_IDENTIFIER PAGE_VIEW_IDENTIFIER SWISHJAM_ORGANIZATION_ID REFERRER URL]

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

    validates :name, presence: true
    validates :swishjam_api_key, presence: true

    scope :by_api_key, -> (api_key) { where(swishjam_api_key: api_key) }
    scope :by_name, -> (name) { where(name:name) }

    def self.PAGE_VIEWS
      by_name(ReservedNames.PAGE_VIEW)
    end
  end
end