class NextAutomationStepConditionRule < Transactional
  class << self
    attr_accessor :required_config_fields
  end
  belongs_to :next_automation_step_condition
  validate :config_has_required_fields
  attribute :config, :jsonb, default: {}

  private

  def config_has_required_fields
    (self.class.required_config_fields || []).each do |field|
      errors.add(:config, "missing required config: #{field}") unless config[field].present?
    end
  end
end