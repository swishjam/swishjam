class ExecutedAutomation < Transactional
  belongs_to :automation
  belongs_to :retried_from_executed_automation, class_name: ExecutedAutomation.to_s, optional: true

  scope :completed, -> { where.not(completed_at: nil) }
  scope :pending, -> { where(completed_at: nil) }

  def completed?
    completed_at.present?
  end

  def pending?
    !completed?
  end
end

