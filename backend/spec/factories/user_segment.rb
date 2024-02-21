FactoryBot.define do
  factory :user_segment do
    association :workspace
    association :created_by_user, factory: :user
    name { "Active Users" }
    description { "All of my active users!" }
  end
end