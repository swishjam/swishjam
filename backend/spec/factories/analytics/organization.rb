FactoryBot.define do
  factory :analytics_organization, class: Analytics::Organization do
    association :swishjam_organization
    name { 'A Waffle Shop customer!' }
    unique_identifier { 'unique-organization-identifier' }
  end
end