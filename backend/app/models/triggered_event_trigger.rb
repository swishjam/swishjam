class TriggeredEventTrigger < Transactional
  belongs_to :workspace
  belongs_to :event_trigger

  attribute :event_json, :jsonb, default: {}
end