class EventTriggerEvaluatorJob
  include Sidekiq::Job
  queue_as :event_triggers

  def perform(public_key, raw_event_array)
    EventTriggers::Evaluator.new(public_key, raw_event_array).evaluate_triggers!
  end
end