FactoryBot.define do
  factory :stripe_integration, class: Integrations::Stripe do
    association :workspace
    type { Integrations::Stripe.to_s }
    config {{ account_id: 'acct_xyz_fake' }}
    enabled { true }
  end

  factory :cal_com_integration, class: Integrations::CalCom do
    association :workspace
    type { Integrations::CalCom.to_s }
    enabled { true }
  end

  factory :resend_integration, class: Integrations::Resend do
    association :workspace
    type { Integrations::Resend.to_s }
    enabled { true }
  end

  factory :resend_destination, class: Integrations::Destinations::Resend do
    association :workspace
    type { Integrations::Destinations::Resend.to_s }
    enabled { true }
    config {{ api_key: 'api_key_xyz_fake' }}
  end
end