module WebEventProcessors
  class Base
    attr_accessor :public_key, :event_json

    def initialize(public_key, event_json)
      @public_key = public_key
      @event_json = event_json
    end

    def uuid
      event_json['uuid']
    end

    def source
      event_json['source']
    end

    def event_name
      event_json['event']
    end
    alias name event_name

    def sdk_version
      event_json['sdk_version']
    end

    def timestamp
      Time.at(event_json['timestamp'] / 1_000)
    end

    def properties
      event_json.except('uuid', 'event', 'timestamp', 'source', 'sdk_version')
    end

    def workspace
      @workspace ||= ApiKey.includes(:workspace).find_by!(public_key: public_key).workspace
    end
  end
end