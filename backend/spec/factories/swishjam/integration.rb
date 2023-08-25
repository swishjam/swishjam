FactoryBot.define do
  factory :stripe_integration, class: Integrations::Stripe do
    association :organization, factory: :swishjam_organization
    type { 'Swishjam::Integrations::Stripe' }
    config {{ account_id: 'fake_stripe_account_id' }}
    enabled { true }
  end
end