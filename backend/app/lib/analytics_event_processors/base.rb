module AnalyticsEventProcessors
  class Base
    def initialize(api_key, event_json)
      @api_key = api_key
      @event_json = event_json
    end

    def process!
      raise "Subclass #{self.class.name} must implement #process! method."
    end

    def swishjam_organization
      @swishjam_organization ||= Swishjam::Organization.find_by!(public_key: @api_key)
    rescue ActiveRecord::RecordNotFound => e
      raise ActiveRecord::RecordNotFound, "Could not find organization with provided public key: #{@api_key}"
    end

    def create_or_update_session
      existing_session = find_or_create_device.sessions.find_by(unique_identifier: unique_session_identifier)
      if existing_session
        existing_session.update!(start_time: timestamp) if timestamp < existing_session.start_time
        existing_session
      else
        find_or_create_device.sessions.create!(unique_identifier: unique_session_identifier, start_time: timestamp)
      end
    end

    def find_or_create_device
      @device ||= swishjam_organization.analytics_devices.find_or_create_by!(fingerprint: fingerprint_value) do |new_device|
        new_device.user_agent = device_data['userAgent']
        new_device.browser = device_data['browser']
        new_device.browser_version = device_data['browserVersion']
        new_device.os = device_data['os']
        new_device.os_version = device_data['osVersion']
      end
    end

    def event_type
      @event_json['type']
    end

    def unique_session_identifier
      @event_json['sessionId']
    end

    def page_view_id
      @event_json['pageViewId']
    end

    def timestamp
      Time.at(epoch_timestamp / 1_000)
    end

    def epoch_timestamp
      @event_json['timestamp']
    end

    def device_data
      @event_json['deviceData'].with_indifferent_access
    end
    
    def data
      (@event_json['data'] || {}).with_indifferent_access
    end

    def fingerprint_value
      device_data['fingerprint']
    end

    def full_url
      @event_json['url']
    end

    def parsed_url
      @parsed_url ||= URI.parse(full_url)
    end

    def url_host
      parsed_url.host
    end

    def url_path
      parsed_url.path
    end

    def url_query
      parsed_url.query
    end
  end
end