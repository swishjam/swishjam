FactoryBot.define do
  factory :next_automation_step_condition_rule do
    association :next_automation_step_condition
  end

  factory :event_property_equals_next_automation_step_condition_rule, parent: :next_automation_step_condition_rule, class: NextAutomationStepConditionRules::EventProperty do
    config {{ property: 'some_property', value: 'some_value' }}
  end
end