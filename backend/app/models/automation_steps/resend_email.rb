module AutomationSteps
  class ResendEmail < AutomationStep
    def execute_automation!(prepared_event, executed_automation_step, as_test: false)
      Automations::ResendEmailExecutor.new(
        automation_step: self, 
        prepared_event: prepared_event, 
        executed_automation_step: executed_automation_step, 
        as_test: as_test
      ).deliver_email_if_necessary!
      executed_automation_step.completed!
    end

    def to_email
      config['to']
    end

    def from_email
      config['from']
    end

    def email_subject
      config['subject']
    end

    def email_body
      config['body']
    end

    def cc_email
      config['cc']
    end

    def bcc_email
      config['bcc']
    end

    def reply_to_email
      config['reply_to']
    end

    def prevent_from_email_being_sent_to_user_multiple_times?
      config['send_once_per_user']
    end

    def prevent_from_email_being_sent_with_unresolved_variables? 
      config['un_resolved_variable_safety_net']
    end
  end
end

