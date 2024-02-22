class TriggeredEventTrigger < Transactional
  class InvalidRetryError < StandardError; end

  belongs_to :workspace
  belongs_to :event_trigger
  belongs_to :retried_triggered_event_trigger, class_name: TriggeredEventTrigger.to_s, optional: true
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
end