class NextAutomationStepCondition < Transactional
  belongs_to :automation_step
  belongs_to :next_automation_step, class_name: AutomationStep.to_s

  attribute :config, :jsonb, default: {}

  def is_satisfied_by_event?(prepared_event)
    raise NotImplementedError, "Subclasss #{self.class} must implement #is_satisfied_by_event?"
  end
end

