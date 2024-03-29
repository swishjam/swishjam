module EventTriggers
  class ResendEmailInvoker
    attr_reader :event_trigger_step, :prepared_event, :triggered_step_record

    def initialize(trigger_step:, prepared_event:, triggered_event_trigger: nil, triggered_event_trigger_step: nil)
      @event_trigger_step = trigger_step
      @prepared_event = prepared_event
      if triggered_event_trigger.nil? && triggered_event_trigger_step.nil?
        raise ArgumentError, "`triggered_event_trigger` or `triggered_event_trigger_step` must be provided"
      end
      @triggered_step_record = triggered_event_trigger_step || TriggeredEventTriggerStep.new(
        started_at: Time.current,
        event_trigger_step: event_trigger_step,
        triggered_event_trigger: triggered_event_trigger,
        triggered_event_json: prepared_event.as_json, 
        triggered_payload: { resend_request_body: request_body }
      )
    end

    def invoke_or_schedule_email_delivery_if_necessary
      if event_trigger_step.config['send_once_per_user'] && has_already_triggered_for_user?
        Sentry.capture_message("Preventing multiple Resend triggers for user #{request_body[:to]} for event_trigger_step_id: #{event_trigger_step.id}.")
        triggered_step_record.error_message = "Prevented multiple Resend triggers for user #{request_body[:to]}."
        triggered_step_record.completed_at = Time.current
        triggered_step_record.save!
        return triggered_step_record
      end

      if event_trigger_step.config['un_resolved_variable_safety_net'] && has_any_un_resolved_variables?
        triggered_step_record.error_message = "Prevented email from being sent with unresolved variables."
        triggered_step_record.completed_at = Time.current
        triggered_step_record.save!
        return triggered_step_record
      end

      should_schedule_delivery = event_trigger_step.config['delay_delivery_by_minutes'].present? && 
                                  event_trigger_step.config['delay_delivery_by_minutes'].to_i > 0 && 
                                  triggered_step_record.triggered_payload['delayed_delivery_at'].nil?
      if should_schedule_delivery
        triggered_step_record.triggered_payload['delayed_delivery_at'] = Time.current
        triggered_step_record.triggered_payload['scheduled_delivery_for'] = Time.current + event_trigger_step.config['delay_delivery_by_minutes'].to_i.minutes
        triggered_step_record.save!
        ScheduledEventTriggerStepJob.perform_in(event_trigger_step.config['delay_delivery_by_minutes'].to_i.minutes, triggered_step_record.id)
        return triggered_step_record
      end

      if triggered_step_record.triggered_payload['scheduled_delivery_for'].present?
        seconds_from_scheduled_delivery = (triggered_step_record.triggered_payload['scheduled_delivery_for'].to_time - Time.current).abs
        if seconds_from_scheduled_delivery > (ENV['SCHEDULED_EVENT_TRIGGER_STEP_DELAY_THRESHOLD_SECONDS'] || (5 * 60)).to_i.seconds
          Sentry.capture_message("ScheduledEventTriggerStepJob for Resend email was scheduled for #{triggered_step_record.triggered_payload['scheduled_delivery_for']} but is being triggered at #{Time.current}.")
        end
        triggered_step_record.triggered_payload.delete('scheduled_delivery_for')
        triggered_step_record.triggered_payload.delete('delayed_delivery_at')
        triggered_step_record.triggered_payload['was_scheduled'] = true
        if triggered_step_record.triggered_payload['scheduled_delivery_canceled_at'].present?
          # already completed and error message set
          triggered_step_record.save!
          return triggered_step_record
        end
        # dont return, continue to deliver email
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
      if !Rails.env.production? && ENV['SEND_RESEND_EVENT_TRIGGERS_IN_DEVELOPMENT'] != 'true'
        triggered_step_record.triggered_payload['resend_response'] = { 'id' => 'stubbed!' }
      else
        resp = HTTParty.post('https://api.resend.com/emails', body: request_body, headers: { 'Authorization' => "Bearer #{resend_api_key}" })
        if resp.code != 200
          Sentry.capture_message("Resend API failed to send email (#{resp['name']}). Error: #{resp['message']}. Payload #{request_body}.")
          triggered_step_record.error_message = "Resend #{resp['name']} API error: #{resp.body}."
        end
        triggered_step_record.triggered_payload['resend_response'] = resp.as_json
      end
    end

    def resend_api_key
      @resend_api_key ||= Integrations::Destinations::Resend.for_workspace(event_trigger_step.event_trigger.workspace).api_key
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
        payload[:reply_to] = EventVariableResolver.interpolated_text(event_trigger_step.config['reply_to'], prepared_event) if event_trigger_step.config['reply_to'].present?
        payload
      end
    end
  end
end