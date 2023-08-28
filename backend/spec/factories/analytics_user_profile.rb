FactoryBot.define do
  factory :analytics_user_profile, class: AnalyticsUserProfile do
    association :workspace, factory: :workspace
    user_unique_identifier { 'the_unique_identifier_provided_from_user' }
    email { 'johnny@appleseed.com' }
    first_name { 'Johnny' }
    last_name { 'Appleseed' }
    metadata {{ favorite_color: 'red' }}
  end
end