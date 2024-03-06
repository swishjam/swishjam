class AutomationStep < Transactional
  include JsonbMethods
  belongs_to :automation
  has_many :executed_automation_steps, dependent: :destroy
  has_many :next_automation_step_conditions
  has_many :next_automation_steps, through: :next_automation_step_conditions
  accepts_nested_attributes_for :next_automation_step_conditions

  before_destroy :destroy_next_automation_step_conditions
  attribute :config, :jsonb, default: {}
  scope :in_sequence_order, -> { order(sequence_index: :ASC) }

  # validates :sequence_index, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, uniqueness: { scope: :automation_id }

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

