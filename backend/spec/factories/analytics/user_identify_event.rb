FactoryBot.define do
  factory :analytics_user_identify_event, class: Analytics::UserIdentifyEvent do
    swishjam_api_key { 'fake_swishjam_api_key' }
    device_identifier { 'fake_device_id' }
    swishjam_user_id { 'fake_swishjam_user_id' }
    occurred_at { 1.minute.ago }
  end
end