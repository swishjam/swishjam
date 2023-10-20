class EventTriggerExecution < Transactional
  belongs_to :workspace
  belongs_to :event_trigger_definition
  has_many :event_trigger_step_executions, dependent: :destroy

  attribute :began_at, default: Time.current
  after_create :execute_event_trigger_steps

  private

  def execute_event_trigger_steps
    event_trigger_definition.event_trigger_step_definition_entry_point.execute!(self)
    update!(completed_at: Time.current)
  rescue => e
    update!(completed_at: Time.current, error_message: e.message)
    Sentry.capture_exception(e)
  end
end