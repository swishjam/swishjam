class ExecutedAutomation < Transactional
  belongs_to :automation
  belongs_to :retried_from_executed_automation, class_name: ExecutedAutomation.to_s, optional: true
  belongs_to :executed_on_user_profile, class_name: AnalyticsUserProfile.to_s

  scope :completed, -> { where.not(completed_at: nil) }
  scope :pending, -> { where(completed_at: nil) }

  attribute :event_json, :jsonb, default: {}

  def completed?
    completed_at.present?
  end

  def pending?
    !completed?
  end

  def completed!
    touch(:completed_at)
  end
end

