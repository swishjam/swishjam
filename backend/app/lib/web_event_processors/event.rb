module WebEventProcessors
  class Event < Base
    def capture!
      Analytics::Event.create!(
        uuid: uuid,
        swishjam_api_key: public_key,
        name: event_name,
        occurred_at: timestamp,
        ingested_at: Time.current,
        properties: properties
      )
    end
  end
end