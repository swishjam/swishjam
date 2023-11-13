class EventTrigger < Transactional
  belongs_to :workspace
  has_many :event_trigger_steps, dependent: :destroy
  accepts_nested_attributes_for :event_trigger_steps
  has_many :triggered_event_triggers, dependent: :destroy

  validates :event_name, presence: true

  def trigger!(event, as_test: false)
    event_trigger_steps.each{ |step| step.trigger!(event) }
    return if as_test
    triggered_event_triggers.create!(
      workspace: workspace, 
      seconds_from_occurred_at_to_triggered: event['occurred_at'] ? Time.current - Time.parse(event['occurred_at']) : -1,
      event_json: event,
    )
  end
end