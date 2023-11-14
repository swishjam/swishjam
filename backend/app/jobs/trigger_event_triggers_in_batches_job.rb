class TriggerEventTriggersInBatchesJob
  include Sidekiq::Job
  queue_as :default

  def perform(array_of_event_json_and_trigger_id)
    array_of_event_json_and_trigger_id.each{ |json| trigger!(json) }
  end

  private

  def trigger!(json)
    trigger = EventTrigger.find(json['trigger_id'])
    trigger.trigger!(json['event'])
  rescue => e
    Sentry.capture_exception(e)
    Rails.logger.error "Failed to trigger the EventTrigger for #{json}: #{e.message}"
  end
end