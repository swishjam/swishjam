module NextAutomationStepConditionRules
  class EventPropertyDoesNotEqual < NextAutomationStepConditionRule
    include EventPropertyNextAutomationStepConditionRuleMethods

    def is_satisfied_by_event?(prepared_event)
      event_value(prepared_event) != expected_value
    end
  end
end