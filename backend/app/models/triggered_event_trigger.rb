class TriggeredEventTrigger < Transactional
  belongs_to :workspace
  belongs_to :event_trigger
  has_many :triggered_event_trigger_steps, dependent: :destroy

  attribute :event_json, :jsonb, default: {}
end