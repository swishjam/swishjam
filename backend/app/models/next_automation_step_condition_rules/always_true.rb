module NextAutomationStepConditionRules
  class AlwaysTrue < NextAutomationStepConditionRule
    def is_satisfied_by_event?(prepared_event)
      true
    end
  end
end