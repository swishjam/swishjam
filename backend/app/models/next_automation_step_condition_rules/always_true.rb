module NextAutomationStepConditionRules
  class AlwaysTrue < NextAutomationStepConditionRule
    def is_satisfied_by_event?(prepared_event)
      true
    end

    def plain_english_description
      # "Always true"
    end
  end
end