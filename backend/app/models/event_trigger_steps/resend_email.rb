module EventTriggerSteps
  class ResendEmail < EventTriggerStep
    validate :config_has_required_fields

    def trigger!(prepared_event, triggered_event_trigger, as_test: false)
      EventTriggers::ResendEmailInvoker.new(
        trigger_step: self, 
        triggered_event_trigger: triggered_event_trigger, 
        prepared_event: prepared_event,
      ).invoke_or_schedule_email_delivery_if_necessary
    end

    private

    def config_has_required_fields
      %w[to from subject body send_once_per_user un_resolved_variable_safety_net].each do |field|
        if config[field].blank? && !config[field].is_a?(FalseClass)
          errors.add(:config, "must have a value for #{field}")
        end
      end
    end
  end
end