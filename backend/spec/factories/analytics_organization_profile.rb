FactoryBot.define do
  factory :analytics_organization_profile, class: AnalyticsOrganizationProfile do
    association :workspace, factory: :workspace
    organization_unique_identifier { 'the_unique_identifier_provided_from_user' }
    name { 'Acme Corp' }
    metadata {{ favorite_color: 'red' }}
  end
end