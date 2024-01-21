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
        ts = event_json['occurred_at'].to_i
        if ts.to_s.length == 10
          Time.at(ts).in_time_zone('UTC')
        elsif ts.to_s.length == 13
          Time.at(ts.to_f / 1000).in_time_zone('UTC')
        else
          raise InvalidEventFormatError, "Event's `occurred_at` value was not in a valid format, it should be a Float or Integer of 10 or 13 characters, provided occurred_at: #{event_json['occurred_at']}"
        end
      end
    end

    def property!(key)
      value = properties[key]
      raise MissingEventPropertyError, "Event properties did not include a `#{key}` key, provided properties: #{properties}" if value.nil?
      value
    end

    def set_user_profile(user_profile)
      return if user_profile.nil?
      event_json['user_profile_id'] = user_profile.id
      event_json['user_properties'] = user_profile.metadata.merge({
        email: user_profile.email,
        unique_identifier: user_profile.user_unique_identifier,
      })
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