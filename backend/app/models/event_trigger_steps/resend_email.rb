module EventTriggerSteps
  class ResendEmail < EventTriggerStep
    validate :config_has_required_fields

    def trigger!(prepared_event, as_test: false)
      EventTriggers::ResendEmailInvoker.new(self, prepared_event).invoke_or_schedule_email_delivery_if_necessary
    end

    def trigger_from_scheduled_delivery!(pending_triggered_step)
      request_body = pending_triggered_step.triggered_payload[:resend_request_body]
      resend_api_key = Integrations::Destinations::Resend.for_workspace(event_trigger.workspace).api_key
      resp = HTTParty.post('https://api.resend.com/emails', body: request_body, headers: { 'Authorization' => "Bearer #{resend_api_key}" })
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