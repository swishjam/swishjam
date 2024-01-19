FactoryBot.define do
  factory :analytics_user_profile_device, class: AnalyticsUserProfileDevice do
    association :workspace, factory: :workspace
    association :analytics_user_profile, factory: :analytics_user_profile
    device_fingerprint { 'a_fingerprint!' }
    swishjam_cookie_value { 'a_cookie_value!' }
  end
end