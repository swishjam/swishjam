module AutomationSteps
  class Exit < AutomationStep
    def execute_automation!(prepared_event, _executed_automation_step, as_test: false)
      executed_automation_step.completed!
    end
  end
end