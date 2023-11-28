FactoryBot.define do
  factory :analytics_swishjam_user_profile, class: Analytics::SwishjamUserProfile do
    swishjam_api_key { 'fake_swishjam_api_key' }
    swishjam_user_id { SecureRandom.uuid }
    unique_identifier { SecureRandom.uuid }
    created_at { 1.minute.ago }
  end
end