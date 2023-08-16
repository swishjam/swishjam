FactoryBot.define do
  factory :analytics_user, class: Analytics::User do
    swishjam_organization
    # metadata
    unique_identifier { 'user-provided-unique-id' }
    email { 'john@example.com' }
    first_name { 'John' }
    last_name { 'Doe' }
  end
end