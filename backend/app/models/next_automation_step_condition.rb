class NextAutomationStepCondition < Transactional
  belongs_to :automation_step
  belongs_to :next_automation_step, class_name: AutomationStep.to_s
  has_many :next_automation_step_condition_rules, dependent: :destroy

  attribute :config, :jsonb, default: {}

  def is_satisfied_by_event?(prepared_event)
    next_automation_step_condition_rules.all? { |rule| rule.is_satisfied_by_event?(prepared_event) }
  end
end