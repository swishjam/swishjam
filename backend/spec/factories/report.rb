FactoryBot.define do
  factory :report do
    association :workspace
    enabled { true }
    name { 'My report' }
    config {{ 'slack_channel_id' => 'STUBBED!' }}
    sending_mechanism { 'slack' }
    cadence { 'daily' }
  end
end