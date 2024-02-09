class EventTriggerStep < Transactional
  belongs_to :event_trigger
  has_many :triggered_event_trigger_steps, dependent: :destroy

  attribute :config, :jsonb, default: {}

  def trigger!(event, as_test: false)
    raise "Subclass #{self.class.to_s} must define `trigger!`."
  end
end