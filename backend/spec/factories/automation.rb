FactoryBot.define do
  factory :automation do
    association :workspace
    association :created_by_user, factory: :user
    name { "My first automation!" }
    enabled { true }
  end
end