FactoryBot.define do
  factory :api_key do
    association :workspace
    data_source { ApiKey::ReservedDataSources.PRODUCT }
  end
end