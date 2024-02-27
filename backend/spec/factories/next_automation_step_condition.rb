FactoryBot.define do
  factory :next_automation_step_condition do
    association :automation_step
    association :next_automation_step, factory: :automation_step
    config { {} }
  end

  factory :always_true_next_automation_step_condition, parent: :next_automation_step_condition do
    type { NextAutomationStepConditions::AlwaysTrue.to_s }
  end
end