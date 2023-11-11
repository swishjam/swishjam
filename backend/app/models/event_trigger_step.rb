class EventTriggerStep < Transactional
  belongs_to :event_trigger

  attribute :config, :jsonb, default: {}

  def trigger!(event)
    raise "Subclass #{self.class.to_s} must define `trigger!`."
  end
end