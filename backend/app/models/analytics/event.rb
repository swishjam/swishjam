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
        METHOD_NAMES = %i[SESSION_IDENTIFIER DEVICE_IDENTIFIER USER_DEVICE_IDENTIFIER ORGANIZATION_DEVICE_IDENTIFIER PAGE_VIEW_IDENTIFIER SWISHJAM_ORGANIZATION_ID REFERRER URL]

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

    class InvalidEventFormat < StandardError; end;

    scope :by_api_key, -> (api_key) { where(swishjam_api_key: api_key) }
    scope :by_name, -> (name) { where(name:name) }

    def self.PAGE_VIEWS
      by_name(ReservedNames.PAGE_VIEW)
    end

    def self.formatted_for_ingestion(uuid:, swishjam_api_key:, name:, occurred_at:, properties: {})
      raise InvalidEventFormat, "Provided keys: uuid: #{uuid}, swishjam_api_key: #{swishjam_api_key}, name: #{name}, occurred_at: #{occurred_at}, properties: #{properties}" if swishjam_api_key.blank? || name.blank? || occurred_at.blank?
      {
        uuid: uuid,
        swishjam_api_key: swishjam_api_key,
        name: name,
        occurred_at: occurred_at,
        properties: properties,
      }
    end
  end
end