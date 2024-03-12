class ExecutedAutomationStep < Transactional
  belongs_to :executed_automation
  belongs_to :automation_step
  has_many :satisfied_next_automation_step_conditions, dependent: :destroy

  scope :pending, -> { where(completed_at: nil) }
  scope :completed, -> { where.not(completed_at: nil) }
  scope :failed, -> { where.not(error_message: nil) }
  scope :completed_successfully, -> { completed.where(error_message: nil) }

  attribute :execution_data, :jsonb, default: {}

  def automation
    automation_step.automation
  end

  def completed!(error_message: nil)
    self.completed_at = Time.current
    self.error_message = error_message
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

