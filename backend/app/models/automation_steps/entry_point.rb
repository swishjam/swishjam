module AutomationSteps
  class EntryPoint < AutomationStep
    self.required_jsonb_fields :config, :event_name
    self.define_jsonb_methods :config, :event_name

    def execute_automation!(prepared_event, _executed_automation_step, as_test: false)
      executed_automation_step.completed!
    end
  end
end