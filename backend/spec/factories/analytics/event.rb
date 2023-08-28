FactoryBot.define do
  factory :analytics_event, class: Analytics::Event do
    swishjam_api_key { 'fake_swishjam_api_key' }
    uuid { 'fake_event_uuid' }
    # device_identifier { 'fake_device_identifier' }
    # session_identifier { 'fake_session_identifier' }
    # swishjam_organization_id { 'fake_swishjam_organization_id' }
    name { 'fake_name' }
    properties {{ foo: 'bar' }}
    occurred_at { 1.minute.ago }
  end
end