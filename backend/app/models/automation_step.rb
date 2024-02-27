class AutomationStep < Transactional
  belongs_to :automation
  has_many :next_automation_step_conditions, dependent: :destroy
  accepts_nested_attributes_for :next_automation_step_conditions
  has_many :next_automation_steps, through: :next_automation_step_conditions

  def execute!
    raise NotImplementedError, "Subclass #{self.class.name} must implement #execute!"
  end
end

