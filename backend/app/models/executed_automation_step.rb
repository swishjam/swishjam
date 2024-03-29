class ExecutedAutomationStep < Transactional
  belongs_to :executed_automation
  belongs_to :automation_step
  has_many :logs, as: :parent, dependent: :destroy
  has_many :satisfied_next_automation_step_conditions, dependent: :destroy

  scope :pending, -> { where(completed_at: nil) }
  scope :completed, -> { where.not(completed_at: nil) }
  scope :failed, -> { where.not(error_message: nil) }
  scope :completed_successfully, -> { completed.where(error_message: nil) }
  scope :succeeded, -> { completed_successfully }

  attribute :execution_data, :jsonb, default: {}
  attribute :response_data, :jsonb, default: {}

  def automation
    automation_step.automation
  end

  def completed!
    self.completed_at = Time.current
    self.save!
    self
  end

  def completed?
    completed_at.present?
  end

  def pending?
    !completed?
  end

  def failed?
    error_message.present?
  end

  def successful?
    error_message.nil?
  end

  def completed_successfully?
    completed? && successful?
  end

  def status
    return "failed" if failed?
    return "completed" if completed?
    "pending"
  end
end

