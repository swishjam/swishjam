module Ingestion
  class TriggerEventTriggerJob
    include Sidekiq::Job
    queue_as :event_triggers_queue

    def perform(trigger_id, prepared_event_json)
      prepared_event = Ingestion::ParsedEventFromIngestion.new(prepared_event_json)
      event_trigger = EventTrigger.find(trigger_id)
      event_trigger.trigger_if_conditions_are_met!(prepared_event)
    end
  end
end