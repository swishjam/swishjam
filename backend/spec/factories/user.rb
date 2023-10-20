FactoryBot.define do
  factory :user do
    email { Faker::Internet.email }
    first_name { Faker::Name.first_name_men }
    last_name { Faker::Name.last_name }
    password { 'foobarbaz' }
  end
end