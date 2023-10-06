FactoryBot.define do
  factory :analytics_event, class: Analytics::Event do
    uuid { SecureRandom.uuid }
    swishjam_api_key { 'fake_swishjam_api_key' }
    name { 'fake_name' }
    properties {{ foo: 'bar' }}
    occurred_at { 1.minute.ago }
  end
end