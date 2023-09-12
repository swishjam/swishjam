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
      @event_json['event_type']
    end
    alias name event_type
    alias event_name event_type

    def unique_session_identifier
      @event_json['session_identifier']
    end

    def page_view_id
      @event_json['page_view_identifier']
    end

    def timestamp
      Time.at(epoch_timestamp / 1_000)
    end

    def epoch_timestamp
      @event_json['timestamp']
    end
    
    def user_provided_data
      (@event_json['data'] || {}).with_indifferent_access
    end

    def device_identifier
      @event_json['device_identifier']
    end

    def full_url
      @event_json['url']
    end

    def referrer_url
      @event_json['referrer']
    end
  end
end