class AutomationStep < Transactional
  include JsonbMethods
  belongs_to :automation
  has_many :executed_automation_steps, dependent: :destroy
  has_many :next_automation_step_conditions
  has_many :next_automation_steps, through: :next_automation_step_conditions
  accepts_nested_attributes_for :next_automation_step_conditions

  before_destroy :destroy_next_automation_step_conditions
  attribute :config, :jsonb, default: {}

  scope :with_enabled_automation, -> { joins(:automation).merge(Automation.enabled) }

  def execute!(prepared_event, executed_automation, executed_automation_step: nil, as_test: false)
    executed_step = executed_automation_step || executed_automation_steps.create!(executed_automation: executed_automation, started_at: Time.current)
    execute_automation!(prepared_event, executed_step, as_test: as_test)
    executed_step
  end

  def execute_automation!(prepared_event, executed_step, as_test: false)
    raise NotImplementedError, "Subclass #{self.class} must implement #execute_automation!"
  end

  private

  def destroy_next_automation_step_conditions
    NextAutomationStepCondition.where(automation_step_id: id).or(NextAutomationStepCondition.where(next_automation_step_id: id)).destroy_all
  end
end

