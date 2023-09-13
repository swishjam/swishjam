module WebEventProcessors
  class Event < Base
    def capture!
      Analytics::Event.create!(
        uuid: uuid,
        swishjam_api_key: @workspace.public_key,
        name: event_name,
        occurred_at: timestamp,
        analytics_family: analytics_family,
        properties: properties
      )
    end
  end
end