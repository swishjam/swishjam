require 'spec_helper'

RSpec.describe ClickHouseQueries::SaasMetrics::ChurnRate::Timeseries do
  describe '#get' do
    it 'returns the churn rate timeseries for the given public keys' do
      my_api_key = 'xyz'
      # 30.times do |i|
      #   FactoryBot.create(:analytics_billing_data_snapshot, swishjam_api_key: my_api_key, captured_at: 30.days.ago - i.day, num_customers_with_paid_subscriptions: 100 - i)
      # end
      # 30.times do |i|
      #   rand(1..10).times do
      #     FactoryBot.create(:analytics_event, swishjam_api_key: my_api_key, name: 'stripe.supplemental.customer.churned', occurred_at: Time.current - i.days)
      #   end
      # end
      churn_date = Time.current
      FactoryBot.create(:analytics_billing_data_snapshot, swishjam_api_key: my_api_key, captured_at: churn_date - 30.days, num_customers_with_paid_subscriptions: 105)
      FactoryBot.create(:analytics_event, swishjam_api_key: my_api_key, name: 'stripe.supplemental.customer.churned', occurred_at: churn_date)

      result = described_class.new(my_api_key).get
      byebug
    end
  end
end