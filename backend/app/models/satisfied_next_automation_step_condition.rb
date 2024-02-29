class SatisfiedNextAutomationStepCondition < Transactional
  belongs_to :executed_automation_step
  belongs_to :next_automation_step_condition
end