module Ingestion
  class ParsedEventFromIngestion
    class InvalidEventFormatError < StandardError; end;
    class MissingEventPropertyError < StandardError; end;
    attr_reader :event_json

    def initialize(event_json)
      @event_json = event_json.with_indifferent_access
      validate!
    end

    def formatted_for_ingestion
      {
        uuid: uuid,
        swishjam_api_key: swishjam_api_key,
        name: name,
        user_profile_id: user_profile_id,
        properties: sanitized_properties.to_json,
        user_properties: user_properties.to_json,
        occurred_at: occurred_at,
        ingested_at: Time.current,
      }
    end

    def as_json
      event_json.merge(properties: properties, user_properties: user_properties)
    end

    def to_json
      as_json.to_json
    end

    def [](key)
      event_json[key]
    end

    def uuid
      event_json['uuid']
    end

    def swishjam_api_key
      event_json['swishjam_api_key']
    end

    def name
      event_json['name']
    end
    alias event_name name

    def user_profile_id
      event_json['user_profile_id']
    end

    def device_identifier
      properties['device_identifier']
    end

    def device_fingerprint
      properties['device_fingerprint']
    end

    def sanitized_properties
      properties.except('device_fingerprint', 'device_identifier', 'user_attributes', 'user', 'userId', 'user_id', 'userIdentifier')
    end

    def properties
      if event_json['properties'].is_a?(String)
        JSON.parse(event_json['properties']).with_indifferent_access
      else
        (event_json['properties'] || {}).with_indifferent_access
      end
    end

    def user_properties
      if event_json['user_properties'].is_a?(String)
        JSON.parse(event_json['user_properties'] || '{}').with_indifferent_access
      else
        (event_json['user_properties'] || {}).with_indifferent_access
      end
    end

    def occurred_at
      @occurred_at ||= begin
        is_valid_format = (event_json['occurred_at'].is_a?(Float) || event_json['occurred_at'].is_a?(Integer)) && 
                            (event_json['occurred_at'].to_i.to_s.length === 10 || event_json['occurred_at'].to_i.to_s.length === 13)
        if is_valid_format
          ts = event_json['occurred_at'].to_f
          ts_in_seconds = ts.to_i.to_s.length === 10 ? ts : ts / 1000.0
          Time.at(ts).in_time_zone('UTC')
        else
          raise InvalidEventFormatError, "Event's `occurred_at` value was not in a valid format, it should be a Float or Integer of 10 or 13 characters. Provided `occurred_at`: #{event_json['occurred_at']}"
        end
      end
    end

    def property!(key)
      value = properties[key]
      raise MissingEventPropertyError, "Event properties did not include a `#{key}` key, provided properties: #{properties}" if value.nil?
      value
    end

    def override_properties!(new_properties)
      event_json['properties'] = new_properties.as_json
    end

    def set_user_profile(user_profile)
      return if user_profile.nil?
      event_json['user_profile_id'] = user_profile.id
      event_json['user_properties'] = user_profile.metadata.merge({
        email: user_profile.email,
        unique_identifier: user_profile.user_unique_identifier,
      })
    end

    def set_organization_profile(organization_profile)
      event_json['organization_profile_id'] = organization_profile.id
    end

    private

    def validate!
      required_keys = %w[uuid swishjam_api_key name occurred_at properties]
      missing_keys = required_keys.select{ |key| event_json[key].blank? }
      if missing_keys.any?
        raise InvalidEventFormatError, "ParsedEventFromIngestion was initialized with missing required keys: #{missing_keys.join(', ')}."
      end
    end
  end
end