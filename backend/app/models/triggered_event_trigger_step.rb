class TriggeredEventTriggerStep < Transactional
  belongs_to :event_trigger_step
  belongs_to :triggered_event_trigger

  attribute :triggered_payload, :jsonb, default: {}
  attribute :triggered_event_json, :jsonb, default: {}
  attribute :started_at, :datetime, default: -> { Time.current }

  scope :completed, -> { where.not(completed_at: nil) }
  scope :in_progress, -> { where(completed_at: nil) }
  scope :failed, -> { where.not(error_message: nil) }
  scope :succeeded, -> { completed.where(error_message: nil) }
  scope :able_to_cancel, -> { in_progress.joins(:event_trigger_step).where(event_trigger_steps: { type: EventTriggerSteps::ResendEmail.to_s }) }

  def failed?
    error_message.present?
  end

  def succeeded?
    completed? && !failed?
  end

  def completed?
    completed_at.present?
  end
  alias is_completed? completed?

  def pending?
    !completed?
  end
  alias is_pending? pending?
end