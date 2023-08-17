FactoryBot.define do
  factory :analytics_organization, class: Analytics::Organization do
    association :swishjam_organization
    name { 'A Waffle Shop customer!' }
    unique_identifier { SecureRandom.hex(10) }
    url { 'https://example.com' }
  end
end