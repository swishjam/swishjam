module NextAutomationStepConditionRules
  class EventPropertyIsNotDefined < NextAutomationStepConditionRule
    include EventPropertyNextAutomationStepConditionRuleMethods

    def is_satisfied_by_event?(prepared_event)
      !has_property?(prepared_event)
    end
  end
end