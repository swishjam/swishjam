FactoryBot.define do
  factory :next_automation_step_condition do
    association :automation_step
    association :next_automation_step, factory: :automation_step
  end
end