class NextAutomationStepCondition < Transactional
  belongs_to :automation_step
  belongs_to :next_automation_step, class_name: AutomationStep.to_s
end

