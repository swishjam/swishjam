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
        organization_profile_id: organization_profile_id,
        properties: sanitized_properties.to_json,
        user_properties: user_properties.to_json,
        organization_properties: organization_properties.to_json,
        occurred_at: occurred_at,
        ingested_at: Time.current.in_time_zone('UTC'),
      }
    end

    def as_json
      event_json.merge(properties: properties, user_properties: user_properties, organization_properties: organization_properties)
    end

    def to_json(*options)
      as_json.to_json(*options)
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

    def organization_profile_id
      event_json['organization_profile_id']
    end

    def device_identifier
      properties['device_identifier']
    end

    def device_fingerprint
      properties['device_fingerprint']
    end

    def sanitized_properties
      # all of attributes that are sent in the event's properties payload, but we don't want to store in the properties column
      properties_to_exclude = %w[device_fingerprint device_identifier]
      if !%w[identify update_user].include?(name)
        properties_to_exclude.concat(%w[user user_id userId userIdentifier organization organizationId organization_id organizationIdentifier organization_identifier orgId org_id orgIdentifier org_identifier])
      end
      if !%w[organization update_organization].include?(name)
        properties_to_exclude.concat(%w[organization organizationId organization_id organizationIdentifier organization_identifier orgId org_id orgIdentifier org_identifier])
      end
      properties.except(*properties_to_exclude)
    end

    def properties
      safe_json(event_json['properties'])
    end

    def user_properties
      safe_json(event_json['user_properties'])
    end

    def organization_properties
      safe_json(event_json['organization_properties'])
    end

    def occurred_at
      @occurred_at ||= begin
        case event_json['occurred_at'].class.to_s
        when Time.to_s, DateTime.to_s, ActiveSupport::TimeWithZone.to_s
          event_json['occurred_at'].in_time_zone('UTC')
        when Float.to_s, Integer.to_s
          is_valid_format = (event_json['occurred_at'].to_i.to_s.length === 10 || event_json['occurred_at'].to_i.to_s.length === 13)
          if !is_valid_format
            raise InvalidEventFormatError, "Event's `occurred_at` value was not in a valid format, it should be a Float or Integer of 10 or 13 characters. Provided `occurred_at`: #{event_json['occurred_at']}"
          end
          ts = event_json['occurred_at'].to_f
          ts_in_seconds = ts.to_i.to_s.length === 10 ? ts : ts / 1000.0
          Time.at(ts_in_seconds).in_time_zone('UTC')
        when String.to_s
          begin
            Time.parse(event_json['occurred_at']).in_time_zone('UTC')
          rescue ArgumentError => e
            raise InvalidEventFormatError, "Invalid `occurred_at` provided, unable to convert String #{event_json['occurred_at']} to time."
          end
        else
          raise InvalidEventFormatError, "Invalid `occurred_at` provided, don't know how to parse a #{event_json['occurred_at'].class} class. Provided `occurred_at`: #{event_json['occurred_at']}"
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
      event_json['user_properties'] = user_profile.metadata.merge(
        email: user_profile.email,
        unique_identifier: user_profile.user_unique_identifier,
        id: user_profile.id,
      )
    end

    def set_organization_profile(organization_profile)
      event_json['organization_profile_id'] = organization_profile.id
      event_json['organization_properties'] = organization_profile.metadata.merge(
        name: organization_profile.name,
        domain: organization_profile.domain,
        unique_identifier: organization_profile.organization_unique_identifier,
        id: organization_profile.id,
      )
    end

    private

    def safe_json(value)
      if value.is_a?(String)
        JSON.parse(value || '{}').with_indifferent_access
      else
        (value || {}).with_indifferent_access
      end
    end

    def validate!
      required_keys = %w[uuid swishjam_api_key name occurred_at]
      missing_keys = required_keys.select{ |key| event_json[key].blank? }
      missing_keys << 'properties' if properties.nil? # properties can be an empty hash
      if missing_keys.any?
        raise InvalidEventFormatError, "ParsedEventFromIngestion was initialized with missing required keys: #{missing_keys.join(', ')}."
      end
    end
  end
end