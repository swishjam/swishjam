module AutomationSteps
  class IfElse < AutomationStep
    def execute_automation!(prepared_event, executed_automation_step, as_test: false)
      # TODO
      executed_automation_step.completed!
    end
  end
end

