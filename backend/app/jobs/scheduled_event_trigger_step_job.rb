class ScheduledEventTriggerStepJob
  include Sidekiq::Worker
  # this is the highest priority queue, does that make sense to use here?
  queue_as :event_triggers_queue

  # this should only be enqueue via ScheduledEventTriggerStepJob.perform_at to ensure that the job is scheduled to run at the correct time
  def perform(triggered_event_trigger_step_id)
    raise "DEPRECATED: WE ARE NOW ON AUTOMATIONS, WHY WOULD THIS TRIGGER?"
    triggered_event_trigger_step = TriggeredEventTriggerStep.find(triggered_event_trigger_step_id)
    event_trigger_step = triggered_event_trigger_step.event_trigger_step
    prepared_event_for_trigger_step = Ingestion::ParsedEventFromIngestion.new(triggered_event_trigger_step.triggered_event_json)
    EventTriggers::ResendEmailInvoker.new(
      trigger_step: event_trigger_step, 
      prepared_event: prepared_event_for_trigger_step, 
      triggered_event_trigger_step: triggered_event_trigger_step
    ).invoke_or_schedule_email_delivery_if_necessary
  end
end