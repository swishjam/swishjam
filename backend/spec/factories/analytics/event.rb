FactoryBot.define do
  factory :analytics_event, class: Analytics::Event do
    uuid { 'fake_event_uuid' }
    swishjam_api_key { 'fake_swishjam_api_key' }
    device_identifier { 'some_device_identifier' }
    session_identifier { 'some_session_identifier' }
    swishjam_organization_id { 'some_swishjam_organization_id' }
    name { 'fake_name' }
    properties {{ foo: 'bar' }}
    occurred_at { 1.minute.ago }
  end
end