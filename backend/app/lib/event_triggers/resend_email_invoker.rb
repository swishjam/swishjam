module EventTriggers
  class ResendEmailInvoker
    attr_reader :event_trigger_step, :prepared_event, :triggered_step_record

    def initialize(resend_email_event_trigger_step, prepared_event, triggered_event_trigger_step: nil)
      @event_trigger_step = resend_email_event_trigger_step
      @prepared_event = prepared_event
      @triggered_step_record = triggered_event_trigger_step || event_trigger_step.triggered_event_trigger_steps.new(
        triggered_event_json: prepared_event.as_json, 
        triggered_payload: { resend_request_body: request_body }
      )
    end

    def invoke_or_schedule_email_delivery_if_necessary(deliver_email_immediately_event_if_config_specifies_delayed_delivery: false)
      if event_trigger_step.config['send_once_per_user'] && has_already_triggered_for_user?
        Sentry.capture_message("Preventing multiple Resend triggers for user #{request_body[:to]} for event_trigger_step_id: #{event_trigger_step.id}.")
        return false
      end

      if event_trigger_step.config['un_resolved_variable_safety_net'] && has_any_un_resolved_variables?
        triggered_step_record.error_message = "Prevented email from being sent with unresolved variables."
        triggered_step_record.completed_at = Time.current
        triggered_step_record.save!
        return triggered_step_record
      end

      if event_trigger_step.config['delay_delivery_by_minutes'].present? && !deliver_email_immediately_event_if_config_specifies_delayed_delivery
        triggered_step_record.triggered_payload['delayed_delivery_at'] = Time.current
        triggered_step_record.triggered_payload['scheduled_delivery_for'] = Time.current + event_trigger_step.config['delay_delivery_by_minutes'].to_i.minutes
        triggered_step_record.save!
        ScheduledEventTriggerStepJob.perform_in(event_trigger_step.config['delay_delivery_by_minutes'].to_i.minutes, triggered_step_record.id)
        return triggered_step_record
      end

      deliver_email!
      triggered_step_record.completed_at = Time.current
      triggered_step_record.save!
      triggered_step_record
    end

    private

    def has_already_triggered_for_user?
      event_trigger_step.triggered_event_trigger_steps.succeeded.where("triggered_payload -> 'resend_request_body' ->> 'to' = ?", request_body[:to]).any?
    end

    def has_any_un_resolved_variables?
      request_body.any?{ |key, value| value.to_s.match?(/\{[^}]+\}/) }
    end

    def deliver_email!
      resend_api_key = Integrations::Destinations::Resend.for_workspace(event_trigger_step.event_trigger.workspace).api_key
      resp = HTTParty.post('https://api.resend.com/emails', body: request_body, headers: { 'Authorization' => "Bearer #{resend_api_key}" })
      if resp.code != 200
        Sentry.capture_message("Resend API failed to send email (#{resp['name']}). Error: #{resp['message']}. Payload #{request_body}.")
        triggered_step_record.error_message = "Resend #{resp['name']} API error: #{resp.body}."
      end
      triggered_step_record.triggered_payload['resend_response'] = resp.as_json
    end

    def request_body
      @request_body ||= begin
        payload = {
          from: EventVariableResolver.interpolated_text(event_trigger_step.config['from'], prepared_event),
          to: EventVariableResolver.interpolated_text(event_trigger_step.config['to'], prepared_event),
          subject: EventVariableResolver.interpolated_text(event_trigger_step.config['subject'], prepared_event),
          text: EventVariableResolver.interpolated_text(event_trigger_step.config['body'], prepared_event),
        }
        payload[:cc] = EventVariableResolver.interpolated_text(event_trigger_step.config['cc'], prepared_event) if event_trigger_step.config['cc'].present?
        payload[:bcc] = EventVariableResolver.interpolated_text(event_trigger_step.config['bcc'], prepared_event) if event_trigger_step.config['bcc'].present?
        payload
      end
    end
  end
end