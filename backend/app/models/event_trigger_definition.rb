class EventTriggerDefinition < Transactional
  belongs_to :workspace
  belongs_to :created_by_user, class_name: User.to_s
  has_many :event_trigger_step_definitions
  has_many :event_trigger_executions
  has_one :event_trigger_step_definition_entry_point, class_name: EventTriggerStepDefinition.to_s

  def execute!(event_payload)
    EventTriggerExecution.create!(
      workspace: workspace, 
      event_trigger_definition: self,
      event_payload: event_payload, 
    )
  end

  def errored!(err_msg)
    update!(completed_at: Time.current, error_message: err_msg)
    Sentry.capture_message(err_msg)
  end

  def completed!
    update!(completed_at: Time.current)
  end
end