module AutomationSteps
  class EntryPoint < AutomationStep
    self.required_jsonb_fields :config, :event_name
    self.define_jsonb_methods :config, :event_name

    def execute_automation!(prepared_event, executed_automation_step, as_test: false)
      # will immediately progress to the satisfied next_automation_step_condition
      executed_automation_step.completed!
    end
  end
end