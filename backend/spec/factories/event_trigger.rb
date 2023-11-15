FactoryBot.define do
  factory :event_trigger do
    association :workspace
    event_name { 'my_event_to_trigger_off_of' }
    enabled { true }
  end
end