module Ingestion
  class TriggerEventTriggersInBatchesJob
    include Sidekiq::Job
    queue_as :event_triggers_queue

    def perform(array_of_event_json_and_trigger_id)
      array_of_event_json_and_trigger_id.each do |json| 
        event_trigger = EventTrigger.find(json['trigger_id'])
        event_trigger.trigger!(json['event'])
      rescue => e
        Sentry.capture_exception(e)
      end
    end
  end
end