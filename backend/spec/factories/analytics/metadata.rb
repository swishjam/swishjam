FactoryBot.define do
  factory :user_metadata, class: Analytics::Metadata do
    association :parent, factory: :analytics_user
    key { 'a-user-key' }
    value { 'a-user-value' }
  end

  factory :event_metadata, class: Analytics::Metadata do
    association :parent, factory: :analytics_event
    key { 'an-event-key' }
    value { 'an-event-value' }
  end
end