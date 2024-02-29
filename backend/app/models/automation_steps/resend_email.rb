module AutomationSteps
  class ResendEmail < AutomationStep
    self.required_jsonb_fields :config, :to, :from, :subject, :body
    self.define_jsonb_methods :config, to: :to_email, from: :from_email, subject: :email_subject, body: :email_body, 
                                        cc: :cc_email, bcc: :bcc_email, reply_to: :reply_to_email, 
                                        send_once_per_user: :prevent_from_email_being_sent_to_user_multiple_times?, 
                                        un_resolved_variable_safety_net: :prevent_from_email_being_sent_with_unresolved_variables?

    def execute_automation!(prepared_event, executed_automation_step, as_test: false)
      # TODO: what if it's as_test?
      Automations::ResendEmailExecutor.new(
        automation_step: self, 
        prepared_event: prepared_event, 
        executed_automation_step: executed_automation_step, 
        as_test: as_test
      ).deliver_email_if_necessary!
      executed_automation_step.completed!
    end
  end
end

