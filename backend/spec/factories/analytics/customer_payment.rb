FactoryBot.define do
  factory :analytics_customer_payment, class: Analytics::CustomerPayment do
    association :swishjam_organization, factory: :swishjam_organization
    association :owner, factory: :analytics_organization
    provider_id { 'fake_stripe_charge_id' }
    customer_email { Faker::Internet.email }
    customer_name { Faker::Name.name }
    amount_in_cents { 100_00 }
    charged_at { 1.hour.ago }
    status { 'succeeded' }
  end
end