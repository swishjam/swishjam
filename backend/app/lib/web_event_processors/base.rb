module WebEventProcessors
  class Base
    attr_accessor :workspace, :event_json

    def initialize(workspace, event_json)
      @workspace = workspace
      @event_json = event_json
    end

    private

    def uuid
      @event_json['uuid']
    end

    def event_type
      @event_json['type']
    end
    alias name event_type
    alias event_name event_type

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
    
    def user_provided_data
      (@event_json['data'] || {}).with_indifferent_access
    end

    def geo_data
      return if @event_json['ip_address'].blank?
      @geo_data ||= Geocoder.search(@event_json['ip_address'])&.first
    end

    def fingerprint_value
      device_data['fingerprint']
    end

    def full_url
      @event_json['url']
    end

    def parsed_url
      @parsed_url ||= URI.parse(full_url || '')
    end
  end
end