class Automation < Transactional
  belongs_to :workspace
  belongs_to :created_by_user, class_name: User.to_s
  has_many :automation_steps, dependent: :destroy
  has_many :next_automation_step_conditions, through: :automation_steps
  has_many :executed_automations, dependent: :destroy
  has_many :executed_automation_steps, through: :executed_automations
  accepts_nested_attributes_for :automation_steps, allow_destroy: true

  def execute!(prepared_event, as_test: false)
    Automations::Executor.new(self, prepared_event, as_test: as_test).execute_automation!
  end

  def first_automation_step
    automation_steps.in_sequence_order.first
  end
end

