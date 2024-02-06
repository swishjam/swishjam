FactoryBot.define do
  factory :analytics_user_profile, class: AnalyticsUserProfile do
    association :workspace, factory: :workspace
    user_unique_identifier { SecureRandom.uuid }
    email { 'johnny@appleseed.com' }
    first_name { 'Johnny' }
    last_name { 'Appleseed' }
    metadata {{ favorite_color: 'red' }}
    created_at { Time.current }
  end
end