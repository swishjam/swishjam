class EventTrigger < Transactional
  belongs_to :workspace
  has_many :event_trigger_steps
  has_many :triggered_event_triggers
  accepts_nested_attributes_for :triggered_event_triggers

  def trigger!(event)
    event_trigger_steps.each do |step|
      step.trigger!(event)
    end
    triggered_event_triggers.create!(workspace: workspace, seconds_from_occurred_at_to_triggered: Time.current - event['occurred_at'])
  end
end