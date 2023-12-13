class Report < Transactional
  belongs_to :workspace
  has_many :triggered_reports, dependent: :destroy

  validates :name, presence: true
  validates :cadence, presence: true, inclusion: { in: %w(daily weekly monthly) }
  validates :sending_mechanism, presence: true, inclusion: { in: %w(slack email sms) }

  # def trigger!(event, as_test: false)
  #   event_trigger_steps.each{ |step| step.trigger!(event) }
  #   return if as_test
  #   seconds_since_occurred_at = event['occurred_at'] ? Time.current - Time.parse(event['occurred_at']) : -1
  #   if seconds_since_occurred_at > (ENV['EVENT_TRIGGER_LAG_WARNING_THRESHOLD'] || 60 * 5).to_i
  #     Sentry.capture_message("EventTrigger #{id} took #{seconds_since_occurred_at} seconds to reach trigger logic.")
  #     return if ENV['DISABLE_EVENT_TRIGGER_WHEN_LAGGING']
  #   end
  #   triggered_event_triggers.create!(
  #     workspace: workspace, 
  #     seconds_from_occurred_at_to_triggered: seconds_since_occurred_at,
  #     event_json: event,
  #   )
  # end
end