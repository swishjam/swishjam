FactoryBot.define do
  factory :analytics_session, class: Analytics::Session do
    association :device, factory: :analytics_device
    association :organization, factory: :analytics_organization
    unique_identifier { 'unique-session-identifier' }
    start_time { Time.now }
  end
end