FactoryBot.define do
  factory :event_trigger_definition do
    association :workspace
    association :created_by_user, factory: :user
    event_name { 'an_event' }
    config {{}}
  end
end