class Automation < Transactional
  belongs_to :workspace
  belongs_to :created_by_user, class_name: User.to_s
  has_many :automation_steps, dependent: :destroy
  has_many :entry_point_automation_steps, -> { where(type: AutomationSteps::EntryPoint.to_s) }, class_name: AutomationSteps::EntryPoint.to_s
  has_many :next_automation_step_conditions, through: :automation_steps
  has_many :executed_automations, dependent: :destroy
  has_many :executed_automation_steps, through: :executed_automations
  accepts_nested_attributes_for :automation_steps, allow_destroy: true

  scope :enabled, -> { where(enabled: true) }
  scope :disabled, -> { where(enabled: false) }

  def execute!(prepared_event, as_test: false)
    Automations::Executor.new(automation: self, prepared_event: prepared_event, as_test: as_test).execute_automation!
  end

  def enable!
    return if enabled?
    update!(enabled: true)
  end

  def disable!
    return if disabled?
    update!(enabled: false)
  end

  def enabled?
    enabled
  end

  def disabled?
    !enabled?
  end
end