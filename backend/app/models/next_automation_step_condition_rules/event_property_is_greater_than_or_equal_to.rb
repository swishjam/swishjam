module NextAutomationStepConditionRules
  class EventPropertyIsGreaterThanOrEqualTo < NextAutomationStepConditionRule
    include EventPropertyNextAutomationStepConditionRuleMethods

    def is_satisfied_by_event?(prepared_event)
      return false if event_value(prepared_event).nil?
      event_value(prepared_event).to_f >= expected_value.to_f
    end
  end
end