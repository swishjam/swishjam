require 'spec_helper'

describe ReportHandlers::MetricsCalculators::RevenueAnalytics do
  before do
    @workspace = FactoryBot.create(:workspace)
    @api_key = FactoryBot.create(:api_key, workspace: @workspace, data_source: ApiKey::ReservedDataSources.STRIPE)
    @public_key = @api_key.public_key
  end

  describe '#new_mrr_for_period' do
    it 'calculates the amount of new MRR for this and the previous period' do
      insert_events_into_click_house!(public_key: @public_key, name: StripeHelpers::SupplementalEvents::NewActiveSubscription.EVENT_NAME) do
        [
          { properties: { mrr: 1000 }, occurred_at: 1.day.ago },
          { properties: { mrr: 2000 }, occurred_at: 2.days.ago },
          { properties: { mrr: 3000 }, occurred_at: 1.week.ago + 1.minute },
          # previous period
          { properties: { mrr: 3000 }, occurred_at: 1.week.ago - 1.minute },
          # outside of the previous period
          { properties: { mrr: 3000 }, occurred_at: 2.weeks.ago - 1.minute }
        ]
      end

      calculator = described_class.new(
        @public_key,
        current_period_start_date: 1.week.ago,
        current_period_end_date: Time.current,
        previous_period_start_date: 2.weeks.ago,
        previous_period_end_date: 1.week.ago
      )
      expect(calculator.new_mrr_for_period).to eq(6_000)
      expect(calculator.new_mrr_for_previous_period).to eq(3_000)
    end
  end

  describe '#num_new_subscriptions_for_period' do
    it 'calculates the number of new subscriptions for this and the previous period' do
      insert_events_into_click_house!(public_key: @public_key, name: StripeHelpers::SupplementalEvents::NewActiveSubscription.EVENT_NAME) do
        [
          { occurred_at: 1.day.ago },
          { occurred_at: 2.days.ago },
          { occurred_at: 1.week.ago + 1.minute },
          # previous period
          { occurred_at: 1.week.ago - 1.minute },
          # outside of the previous period
          { occurred_at: 2.weeks.ago - 1.minute }
        ]
      end

      calculator = described_class.new(
        @public_key,
        current_period_start_date: 1.week.ago,
        current_period_end_date: Time.current,
        previous_period_start_date: 2.weeks.ago,
        previous_period_end_date: 1.week.ago
      )
      expect(calculator.num_new_subscriptions_for_period).to eq(3)
      expect(calculator.num_new_subscriptions_for_previous_period).to eq(1)
    end
  end
end