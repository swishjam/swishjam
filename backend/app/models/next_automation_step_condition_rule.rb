class NextAutomationStepConditionRule < Transactional
  include JsonbMethods
  belongs_to :next_automation_step_condition
  attribute :config, :jsonb, default: {}

  def is_satisfied_by_event?(_prepared_event)
    raise NotImplementedError, "Subclass #{self.class.name} must implement #is_satisfied_by_event? method"
  end
end