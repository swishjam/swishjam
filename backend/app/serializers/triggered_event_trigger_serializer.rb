class TriggeredEventTriggerSerializer < ActiveModel::Serializer
  attributes :created_at, :event_json, :triggered_event_trigger_steps

  def triggered_event_trigger_steps
    object.triggered_event_trigger_steps.map do |step|
      {
        started_at: step.started_at,
        completed_at: step.completed_at,
        error_message: step.error_message,
        triggered_payload: step.triggered_payload,
      }
    end
  end
end