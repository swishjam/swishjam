class EventTrigger < Transactional
  belongs_to :workspace
  has_many :event_trigger_steps, dependent: :destroy
  accepts_nested_attributes_for :event_trigger_steps
  has_many :triggered_event_triggers, dependent: :destroy

  scope :enabled, -> { where(enabled: true) }
  scope :disabled, -> { where(enabled: false) }

  validates :event_name, presence: true

  def trigger!(event, as_test: false)
    if triggered_event_triggers.find_by("event_json->>'uuid' = ?", event['uuid']).present?
      Sentry.capture_message("Duplicate EventTrigger prevented. EventTrigger #{id} already triggered for event #{event['uuid']} (#{event['name']} event for #{workspace.name} workspace).")
    else
      event_trigger_steps.each{ |step| step.trigger!(event) }
      return if as_test
      seconds_since_occurred_at = event['occurred_at'] ? Time.current - Time.parse(event['occurred_at']) : -1
      if seconds_since_occurred_at > (ENV['EVENT_TRIGGER_LAG_WARNING_THRESHOLD'] || 60 * 5).to_i
        Sentry.capture_message("EventTrigger #{id} took #{seconds_since_occurred_at} seconds to reach trigger logic.")
        return if ENV['DISABLE_EVENT_TRIGGER_WHEN_LAGGING']
      end
      triggered_event_triggers.create!(
        workspace: workspace, 
        seconds_from_occurred_at_to_triggered: seconds_since_occurred_at,
        event_json: event,
      )
    end
  end
end