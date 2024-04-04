class ExecutedAutomation < Transactional
  belongs_to :automation
  belongs_to :retried_from_executed_automation, class_name: ExecutedAutomation.to_s, optional: true
  belongs_to :executed_on_user_profile, class_name: AnalyticsUserProfile.to_s, optional: true
  has_many :executed_automation_steps, dependent: :destroy

  scope :completed, -> { where.not(completed_at: nil) }
  scope :pending, -> { where(completed_at: nil) }
  scope :test_executions, -> { where(is_test_execution: true) }
  scope :non_test_executions, -> { where(is_test_execution: false) }
  scope :that_executed_all_automation_steps, ->(automation_step_ids) { 
    joins(:executed_automation_steps)
    .where(executed_automation_steps: { automation_step_id: automation_step_ids })
    .group('executed_automations.id')
    .having('COUNT(DISTINCT executed_automation_steps.automation_step_id) = ?', automation_step_ids.count)
  }

  attribute :event_json, :jsonb, default: {}

  def completed?
    completed_at.present?
  end

  def pending?
    !completed?
  end

  def status
    completed? ? "completed" : "pending"
  end

  def completed!
    touch(:completed_at)
  end
end

