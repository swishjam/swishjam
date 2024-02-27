FactoryBot.define do
  factory :integration do
    association :workspace
    enabled { true }
    config { {} }
  end

  factory :stripe_integration, class: Integrations::Stripe, parent: :integration do
    config {{ account_id: 'acct_xyz_fake' }}
  end

  factory :cal_com_integration, class: Integrations::CalCom, parent: :integration do
  end

  factory :resend_integration, class: Integrations::Resend, parent: :integration do
  end

  factory :resend_destination, class: Integrations::Destinations::Resend, parent: :integration do
    config {{ api_key: 'api_key_xyz_fake' }}
  end

  factory :slack_destination, class: Integrations::Destinations::Slack, parent: :integration do
    config {{ access_token: 'stubbed' }}
  end
end