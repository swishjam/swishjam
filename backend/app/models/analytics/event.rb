module Analytics
  class Event < ClickHouseRecord
    class ReservedNames
      class << self
        METHOD_NAMES = %i[PAGE_VIEW PAGE_LEFT NEW_SESSION MRR_MOVEMENT NEW_SUBSCRIBER CHURNED_SUBSCRIBER REACTIVATED_SUBCRIBER]
        
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
        METHOD_NAMES = %i[SESSION_IDENTIFIER DEVICE_IDENTIFIER USER_DEVICE_IDENTIFIER ORGANIZATION_DEVICE_IDENTIFIER PAGE_VIEW_IDENTIFIER SWISHJAM_ORGANIZATION_ID REFERRER URL USER_PROFILE_ID]

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

    def self.formatted_for_ingestion(uuid:, swishjam_api_key:, name:, user_profile_id:, properties: {}, user_properties: {}, occurred_at:, ingested_at: Time.current)
      required_keys = { uuid: uuid, swishjam_api_key: swishjam_api_key, name: name, user_profile_id: user_profile_id, occurred_at: occurred_at, ingested_at: ingested_at, properties: properties }
      missing_keys = required_keys.select{ |key, value| value.blank? || value.nil? }
      if missing_keys.any?
        raise InvalidEventFormat, "Missing required keys: #{missing_keys.keys.join(', ')}"
      end
      {
        uuid: uuid,
        swishjam_api_key: swishjam_api_key,
        name: name,
        user_profile_id: user_profile_id,
        properties: properties.to_json,
        user_properties: user_properties.to_json,
        # TODO: make sure this is handling things correctly
        occurred_at: Time.parse(occurred_at.to_s).in_time_zone('UTC'), 
        ingested_at: ingested_at,
      }
    end

    def self.parsed_from_ingestion_queue(event_json_or_string)
      event_json = (event_json_or_string.is_a?(String) ? JSON.parse(event_json_or_string) : event_json_or_string).with_indifferent_access
      properties = (event_json['properties'] || {}).is_a?(String) ? JSON.parse(event_json['properties']) : event_json['properties']

      properties['user_attributes'] ||= {}
      properties['user_attributes'] = (properties['user_attributes'] || {}).is_a?(String) ? JSON.parse(properties['user_attributes']) : properties['user_attributes']
      
      properties['organization_attributes'] ||= {}
      properties['organization_attributes'] = (properties['organization_attributes'] || {}).is_a?(String) ? JSON.parse(properties['organization_attributes']) : properties['organization_attributes']
      required_keys = ['uuid', 'swishjam_api_key', 'name', 'timestamp']
      missing_keys = required_keys.select{ |key| event_json[key].blank? }
      if missing_keys.any?
        raise InvalidEventFormat, "Missing required keys: #{missing_keys.join(', ')}."
      end
      OpenStruct.new(
        uuid: event_json['uuid'],
        swishjam_api_key: event_json['swishjam_api_key'],
        name: event_json['name'],
        # pretty sure it's always `timestamp` from instrumentation, but just incase we'll check both
        occurred_at: Time.parse((event_json['timestamp'] || event_json['occurred_at']).to_s).in_time_zone('UTC'),
        timestamp: Time.parse((event_json['timestamp'] || event_json['occurred_at']).to_s).in_time_zone('UTC'),
        properties: Util.deep_to_ostruct(properties),
      )
    end
  end
end