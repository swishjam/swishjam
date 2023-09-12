module WebEventProcessors
  class Event < Base
    def capture!
      Analytics::Event.create!(
        uuid: uuid,
        swishjam_api_key: @workspace.public_key,
        name: event_name,
        occurred_at: timestamp,
        properties: {
          session_identifier: unique_session_identifier,
          device_identifier: device_identifier,
          swishjam_organization_id: nil, 
          url: full_url, 
          referrer: referrer_url, 
          is_mobile: @event_json['is_mobile'], 
          browser: @event_json['browser'], 
          browser_version: @event_json['browser_version'], 
          os: @event_json['os'], 
          os_version: @event_json['os_version'], 
          user_agent: @event_json['user_agent'],
        }
      )
    end
  end
end