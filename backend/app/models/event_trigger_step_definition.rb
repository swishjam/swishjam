class EventTriggerStepDefinition < Transactional
  class EventTriggerStepException < StandardError; end;

  belongs_to :event_trigger_definition
  belongs_to :previous_event_trigger_step_definition, class_name: EventTriggerStepDefinition.to_s, optional: true
  belongs_to :next_event_trigger_step_definition, class_name: EventTriggerStepDefinition.to_s, optional: true
  has_many :event_trigger_step_executions, dependent: :destroy

  def execute!(event_trigger_execution, previous_step_execution = nil)
    EventTriggerStepExecution.create!(
      event_trigger_step_definition: self, 
      event_trigger_execution: event_trigger_execution, 
      previous_event_trigger_step_execution: previous_step_execution
    )
  end

  def errored!(err_msg)
    update!(completed_at: Time.current, error_message: err_msg)
    raise EventTriggerStepException, err_msg
  end

  def completed!
    update!(completed_at: Time.current)
  end

  def is_first_step?
    previous_event_trigger_step_definition.nil?
  end
  alias is_entry_point? is_first_step?

  def is_final_step?
    next_event_trigger_step_definition.nil?
  end
end