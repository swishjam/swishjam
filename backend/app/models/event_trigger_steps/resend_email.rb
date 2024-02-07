module EventTriggerSteps
  class ResendEmail < EventTriggerStep
    validate :config_has_required_fields

    def trigger!(prepared_event, as_test: false)
      to_email = EventVariableResolver.interpolated_text(config['to'], prepared_event)
      if config['send_once_per_user']
        if event_trigger.triggered_event_trigger_steps.where("event_trigger_steps.id = ? AND triggered_payload->>'to' = ?", id, to_email).any?
          Sentry.capture_message("Preventing multiple Resend triggers for user #{to_email} for event_trigger_step_id: #{id}.")
          return false
        end
      end

      from_email = EventVariableResolver.interpolated_text(config['from'], prepared_event)
      subject = EventVariableResolver.interpolated_text(config['subject'], prepared_event)
      body = EventVariableResolver.interpolated_text(config['body'], prepared_event)
      request_body = { from: from_email, to: to_email, subject: subject, text: body }

      if config['cc'].present?
        request_body[:cc] = EventVariableResolver.interpolated_text(config['cc'], prepared_event)
      end
      if config['bcc'].present?
        request_body[:bcc] = EventVariableResolver.interpolated_text(config['bcc'], prepared_event)
      end

      if config['un_resolved_variable_safety_net']
        if has_any_un_resolved_variables?(request_body)
          send_un_resolved_variables_notification(prepared_event, request_body)
          return false
        end
      end

      resend_api_key = Integrations::Destinations::Resend.for_workspace(event_trigger.workspace).api_key
      resp = HTTParty.post('https://api.resend.com/emails', body: request_body, headers: { 'Authorization' => "Bearer #{resend_api_key}" })
      if resp.code != 200
        Sentry.capture_message("Resend API failed to send email. Not considering this a TriggeredEventTriggerStep. Response: #{resp.body}. Payload #{request_body}.")
        return false
      end
      triggered_event_trigger_steps.create!(triggered_payload: { request: request_body, response: JSON.parse(resp.body) })
    end

    private

    def send_un_resolved_variables_notification(prepared_event, request_body)
      # TODO!
    end

    def has_any_un_resolved_variables?(request_body)
      request_body.any?{ |key, value| value.to_s.match?(/\{[^}]+\}/) }
    end

    def config_has_required_fields
      %w[to from subject body send_once_per_user un_resolved_variable_safety_net].each do |field|
        if config[field].blank? && !config[field].is_a?(FalseClass)
          errors.add(:config, "must have a value for #{field}")
        end
      end
    end
  end
end