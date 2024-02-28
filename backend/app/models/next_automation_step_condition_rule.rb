class NextAutomationStepConditionRule < Transactional
  class << self
    attr_accessor :required_config_fields
  end
  belongs_to :next_automation_step_condition
  validate :config_has_required_fields
  attribute :config, :jsonb, default: {}

  (self.required_config_fields || []).each do |field|
    define_method(field) do
      config[field]
    end
  end

  def is_satisfied_by_event?(_prepared_event)
    raise NotImplementedError, "Subclass #{self.class.name} must implement #is_satisfied_by_event? method"
  end

  private

  def config_has_required_fields
    (self.class.required_config_fields || []).each do |field|
      errors.add(:config, "missing required config: #{field}") unless config[field].present?
    end
  end
end