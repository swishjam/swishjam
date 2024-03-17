module AutomationSteps
  class Exit < AutomationStep
    def execute_automation!(prepared_event, executed_automation_step, as_test: false)
      # will immediately progress to the satisfied next_automation_step_condition
      # we should be able to assume this is always the last step, so the automation will complete after this
      executed_automation_step.completed!
    end
  end
end