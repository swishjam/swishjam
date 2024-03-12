module Automations
  class ResendEmailExecutor
    attr_reader :prepared_event, :automation_step, :executed_automation_step

    def initialize(prepared_event:, automation_step:, executed_automation_step:, as_test: false)
      @prepared_event = prepared_event
      @automation_step = automation_step
      @executed_automation_step = executed_automation_step
      executed_automation_step.execution_data['resend_request_body'] = request_body
    end

    def deliver_email_if_necessary!
      if automation_step.prevent_from_email_being_sent_to_user_multiple_times? && has_already_executed_for_user?
        msg = "Prevented multiple Resend Email automations for user #{request_body[:to]}."
        Sentry.capture_message(msg, level: :info, extra: { automation_step_id: automation_step.id, event_uuid: prepared_event.uuid })
        executed_automation_step.completed!(error_message: msg)
        return executed_automation_step
      end

      # if automation_step.prevent_from_email_being_sent_with_unresolved_variables? && has_any_un_resolved_variables?
      if has_any_un_resolved_variables?
        executed_automation_step.completed!(error_message: "Prevented email from being sent with unresolved variables.")
        return executed_automation_step
      end

      deliver_email!
      executed_automation_step.completed!
      executed_automation_step
    end

    private

    def has_already_executed_for_user?
      automation_step.executed_automation_steps.succeeded.where("execution_data -> 'resend_request_body' ->> 'to' = ?", request_body[:to]).any?
    end

    def has_any_un_resolved_variables?
      request_body.any?{ |key, value| value.to_s.match?(/\{[^}]+\}/) }
    end

    def deliver_email!
      if !Rails.env.production? && ENV['SEND_RESEND_EVENT_TRIGGERS_IN_DEVELOPMENT'] != 'true'
        executed_automation_step.execution_data['resend_response'] = { 'id' => 'stubbed!' }
      else
        resp = HTTParty.post('https://api.resend.com/emails', body: request_body, headers: { 'Authorization' => "Bearer #{resend_api_key}" })
        if resp.code != 200
          Sentry.capture_message("Resend API failed to send email (#{resp['name']}). Error: #{resp['message']}. Payload #{request_body}.")
          executed_automation_step.error_message = "Resend #{resp['name']} API error: #{resp.body}."
        end
        executed_automation_step.execution_data['resend_response'] = resp.as_json
      end
    end

    def resend_api_key
      @resend_api_key ||= Integrations::Destinations::Resend.for_workspace(automation_step.automation.workspace).api_key
    end

    def request_body
      @request_body ||= begin
        payload = {
          from: EventVariableResolver.interpolated_text(automation_step.from_email, prepared_event),
          to: EventVariableResolver.interpolated_text(automation_step.to_email, prepared_event),
          subject: EventVariableResolver.interpolated_text(automation_step.email_subject, prepared_event),
          text: EventVariableResolver.interpolated_text(automation_step.email_body, prepared_event),
        }
        payload[:cc] = EventVariableResolver.interpolated_text(automation_step.cc_email, prepared_event) if automation_step.cc_email.present?
        payload[:bcc] = EventVariableResolver.interpolated_text(automation_step.bcc_email, prepared_event) if automation_step.bcc_email.present?
        payload[:reply_to] = EventVariableResolver.interpolated_text(automation_step.reply_to_email, prepared_event) if automation_step.reply_to_email.present?
        payload
      end
    end
  end
end