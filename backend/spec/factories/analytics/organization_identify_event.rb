FactoryBot.define do
  factory :analytics_organization_identify_event, class: Analytics::OrganizationIdentifyEvent do
    swishjam_api_key { 'fake_swishjam_api_key' }
    device_identifier { 'fake_device_id' }
    session_identifier { 'fake_session_id' }
    swishjam_organization_id { 'fake_swishjam_organization_id' }
    occurred_at { 1.minute.ago }
  end
end