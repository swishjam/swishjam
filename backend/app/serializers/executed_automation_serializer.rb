class ExecutedAutomationSerializer < ActiveModel::Serializer
  attributes :id, :started_at, :completed_at, :event_json, :status, :is_test_execution

  belongs_to :executed_on_user_profile do
    {
      id: object.executed_on_user_profile_id,
      email: object.executed_on_user_profile&.email,
      metadata: object.executed_on_user_profile&.metadata
    }
  end

  has_many :executed_automation_steps do
    object.executed_automation_steps
          .includes(:logs, :automation_step, :satisfied_next_automation_step_conditions)
          .order(started_at: :ASC)
          .map do |executed_step|
      {
        id: executed_step.id,
        execution_data: executed_step.execution_data,
        response_data: executed_step.response_data,
        error_message: executed_step.error_message,
        started_at: executed_step.started_at,
        completed_at: executed_step.completed_at,
        status: executed_step.status,
        logs: executed_step.logs.order(timestamp: :ASC).map do |log|
          {
            id: log.id,
            level: log.level,
            message: log.message,
            metadata: log.metadata,
            timestamp: log.timestamp,
          }
        end,
        automation_step: AutomationStepSerializer.new(executed_step.automation_step),
        satisfied_next_automation_step_conditions: executed_step.satisfied_next_automation_step_conditions.map do |satisfied_condition|
          {
            created_at: satisfied_condition.created_at,
            executed_automation_step_id: satisfied_condition.executed_automation_step_id,
            next_automation_step_condition_id: satisfied_condition.next_automation_step_condition_id,
          }
        end
      }
    end
  end
end