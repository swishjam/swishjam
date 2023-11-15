FactoryBot.define do
  factory :event_trigger_step do
    association :event_trigger
    type { 'EventTriggerSteps::Slack' }
    config {{ stubbed: true }}
  end
end