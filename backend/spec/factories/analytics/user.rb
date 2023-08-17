FactoryBot.define do
  factory :analytics_user, class: Analytics::User do
    swishjam_organization
    unique_identifier { SecureRandom.hex(10) }
    email { 'john@example.com' }
    first_name { 'John' }
    last_name { 'Doe' }
  end
end