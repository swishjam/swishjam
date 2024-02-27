FactoryBot.define do
  factory :automation do
    association :workspace
    association :created_by_user, factory: :user
    name { "My first automation!" }
    entry_point_event_name { 'my_event_to_trigger_automation' }
    enabled { true }
  end
end