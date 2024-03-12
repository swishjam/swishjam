class NextAutomationStepCondition < Transactional
  belongs_to :automation_step
  belongs_to :next_automation_step, class_name: AutomationStep.to_s
  has_many :next_automation_step_condition_rules, dependent: :destroy
  alias_attribute :rules, :next_automation_step_condition_rules
  has_many :satisfied_next_automation_step_conditions, dependent: :destroy
  accepts_nested_attributes_for :next_automation_step_condition_rules, allow_destroy: true

  def is_satisfied_by_event?(prepared_event)
    next_automation_step_condition_rules.all? { |rule| rule.is_satisfied_by_event?(prepared_event) }
  end
end