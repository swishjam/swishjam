module NextAutomationStepConditionRules
  class EventPropertyDoesNotContain < NextAutomationStepConditionRule
    include EventPropertyNextAutomationStepConditionRuleMethods

    def is_satisfied_by_event?(prepared_event)
      return false if event_value(prepared_event).nil?
      !event_value(prepared_event).include?(expected_value)
    end
  end
end