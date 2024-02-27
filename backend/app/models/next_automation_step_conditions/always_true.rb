module NextAutomationStepConditions
  class AlwaysTrue < NextAutomationStepCondition
    def is_satisfied_by_event?(prepared_event)
      true
    end
  end
end