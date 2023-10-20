class EventTriggerStepExecution < Transactional
  belongs_to :event_trigger_step_definition
  belongs_to :event_trigger_execution
  belongs_to :previous_event_trigger_step_execution, class_name: EventTriggerStepExecution.to_s, optional: true
  has_one :next_event_trigger_step_execution, class_name: EventTriggerStepExecution.to_s, foreign_key: :previous_event_trigger_step_execution_id

  attribute :began_at, default: Time.current
  after_create :execute_next_step_if_necessary

  private

  def execute_next_step_if_necessary
    return if event_trigger_step_definition.next_event_trigger_step_definition.nil?
    create!(
      began_at: Time.current,
      event_trigger_step_definition: event_trigger_step_definition.next_event_trigger_step_definition,
      event_trigger_execution: event_trigger_execution, 
      previous_event_trigger_step_execution: self,
    )
  end
end