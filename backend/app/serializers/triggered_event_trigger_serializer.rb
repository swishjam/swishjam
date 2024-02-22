class TriggeredEventTriggerSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :event_json, :event_trigger_id, :triggered_event_trigger_steps, :retried_triggered_event_trigger_id

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