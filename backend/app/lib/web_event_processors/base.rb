module WebEventProcessors
  class Base
    attr_accessor :workspace, :event_json

    def initialize(workspace, event_json)
      @workspace = workspace
      @event_json = event_json
    end

    private

    def uuid
      event_json['uuid']
    end

    def event_name
      event_json['event_name']
    end
    alias name event_name

    def source
      event_json['source']
    end

    def analytics_family
      @analytics_family ||= WebEventProcessors::AnalyticsFamilyDecider.decide(workspace, self)
    end

    def timestamp
      Time.at(event_json['timestamp'] / 1_000)
    end
    
    def properties
      event_json.except('uuid', 'event_name', 'analytics_family', 'timestamp')
    end
  end
end