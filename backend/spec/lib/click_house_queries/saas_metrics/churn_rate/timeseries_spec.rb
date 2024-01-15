require 'spec_helper'

RSpec.describe ClickHouseQueries::SaasMetrics::ChurnRate::Timeseries do
  describe '#get' do
    it 'returns the churn rate timeseries for the given public keys' do
      my_api_key = 'xyz'
      current_time = Time.current
      # two days ago churn_period
      FactoryBot.create(:analytics_billing_data_snapshot, swishjam_api_key: my_api_key, captured_at: current_time - 32.days, num_customers_with_paid_subscriptions: 90)
      # yesterdays churn_period
      FactoryBot.create(:analytics_billing_data_snapshot, swishjam_api_key: my_api_key, captured_at: current_time - 31.days, num_customers_with_paid_subscriptions: 100)
      # todays churn_period
      FactoryBot.create(:analytics_billing_data_snapshot, swishjam_api_key: my_api_key, captured_at: current_time - 30.days, num_customers_with_paid_subscriptions: 110)
      # tomorrows churn_period
      FactoryBot.create(:analytics_billing_data_snapshot, swishjam_api_key: my_api_key, captured_at: current_time - 29.days, num_customers_with_paid_subscriptions: 120)

      FactoryBot.create(:analytics_event, swishjam_api_key: my_api_key, name: 'stripe.supplemental.customer.churned', occurred_at: current_time)
      FactoryBot.create(:analytics_event, swishjam_api_key: my_api_key, name: 'stripe.supplemental.customer.churned', occurred_at: current_time - 2.days)
      FactoryBot.create(:analytics_event, swishjam_api_key: my_api_key, name: 'stripe.supplemental.customer.churned', occurred_at: current_time - 3.days)
      FactoryBot.create(:analytics_event, swishjam_api_key: my_api_key, name: 'stripe.supplemental.customer.churned', occurred_at: current_time - 1.day)
      FactoryBot.create(:analytics_event, swishjam_api_key: my_api_key, name: 'stripe.supplemental.customer.churned', occurred_at: current_time + 1.minute)
      FactoryBot.create(:analytics_event, swishjam_api_key: my_api_key, name: 'a_different_event', occurred_at: current_time - 3.days)
      FactoryBot.create(:analytics_event, swishjam_api_key: 'someone_else', name: 'stripe.supplemental.customer.churned', occurred_at: current_time - 3.days)

      results = described_class.new(my_api_key).get
      todays_churn_period = results.find{ |r| r['churn_period_end_date'].to_datetime.to_s == current_time.to_datetime.to_s }
      expect(todays_churn_period['num_churned_subscriptions_in_period']).to eq(4)
      expect(todays_churn_period['num_customers_with_paid_subscriptions_at_snapshot_date']).to eq(110)
      expect(todays_churn_period['churn_rate']).to eq((4.0 / 110 * 100).round(2))

      yesterdays_churn_period = results.find{ |r| r['churn_period_end_date'].to_datetime.to_s == (current_time - 1.day).to_datetime.to_s }
      expect(yesterdays_churn_period['num_churned_subscriptions_in_period']).to eq(3)
      expect(yesterdays_churn_period['num_customers_with_paid_subscriptions_at_snapshot_date']).to eq(100)
      expect(yesterdays_churn_period['churn_rate']).to eq((3.0 / 100 * 100).round(2))

      two_days_ago_churn_period = results.find{ |r| r['churn_period_end_date'].to_datetime.to_s == (current_time - 2.days).to_datetime.to_s }
      expect(two_days_ago_churn_period['num_churned_subscriptions_in_period']).to eq(2)
      expect(two_days_ago_churn_period['num_customers_with_paid_subscriptions_at_snapshot_date']).to eq(90)
      expect(two_days_ago_churn_period['churn_rate']).to eq((2.0 / 90 * 100).round(2))
    end
  end
end