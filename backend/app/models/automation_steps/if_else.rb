module AutomationSteps
  class IfElse < AutomationStep
    def execute_automation!(prepared_event, executed_automation_step, as_test: false)
      # will immediately progress to the satisfied next_automation_step_condition
      executed_automation_step.completed!
    end
  end
end

