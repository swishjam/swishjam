class TriggeredEventTrigger < Transactional
  class InvalidRetryError < StandardError; end

  belongs_to :workspace
  belongs_to :event_trigger
  belongs_to :retried_triggered_event_trigger, class_name: TriggeredEventTrigger.to_s, optional: true
  has_one :triggered_event_trigger_retried_from, class_name: TriggeredEventTrigger.to_s, foreign_key: :retried_triggered_event_trigger_id, dependent: :nullify
  has_many :triggered_event_trigger_steps, dependent: :destroy

  attribute :event_json, :jsonb, default: {}

  def retry!(as_test: false, override_only_failed_rule: false)
    if can_retry? || override_only_failed_rule
      retried_triggered_event_trigger = event_trigger.trigger_if_conditions_are_met!(Ingestion::ParsedEventFromIngestion.new(event_json), as_test: as_test, is_retry: true)
      return false unless retried_triggered_event_trigger
      update!(retried_triggered_event_trigger: retried_triggered_event_trigger) 
      retried_triggered_event_trigger
    else
      raise InvalidRetryError, "Cannot retry TriggeredEventTrigger #{id} because none of its steps have failed. If you want to bypass this check, pass `override_only_failed_rule: true`."
    end
  end

  def can_retry?
    retried_triggered_event_trigger_id.nil? && triggered_event_trigger_steps.failed.any?
  end

  def cancel!(user_email)
    if can_cancel?
      triggered_event_trigger_steps.able_to_cancel.each do |triggered_step|
        triggered_step.triggered_payload['scheduled_delivery_canceled_at'] = Time.current
        triggered_step.error_message = "Scheduled delivery was canceled by #{user_email}."
        triggered_step.completed_at = Time.current
        triggered_step.save!
      end
    else
      raise "Cannot cancel TriggeredEventTrigger #{id} because it is not in a state where it can be canceled."
    end
  end

  def can_cancel?
    triggered_event_trigger_steps.able_to_cancel.any?
  end
end