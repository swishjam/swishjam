class TriggeredEventTriggerStep < Transactional
  belongs_to :event_trigger_step
  attribute :triggered_payload, :jsonb, default: {}
end