require 'spec_helper'

RSpec.describe StripeHelpers::MetricsCalculator do
  before do
    setup_test_data
    @metrics_calculator = StripeHelpers::MetricsCalculator.new('STUBBED_STRIPE_ACCOUNT_ID')
  end

  describe '#mrr' do
    it 'returns the total MRR of all active subscriptions for that stripe account' do
      mocked_subscription_1 = mocked_stripe_subscription(
        num_items: 1, 
        items_quantities: [1], 
        items_unit_amounts: [10_000], 
        items_intervals: ['month']
      )
      mocked_subscription_2 = mocked_stripe_subscription(
        num_items: 3, 
        items_quantities: [1, 2, 1],
        items_unit_amounts: [100, 2_000, 20_000], 
        items_intervals: ['day', 'month', 'year']
      )
      mocked_subscription_3 = mocked_stripe_subscription(
        num_items: 3, 
        items_quantities: [1, 2, 1],
        items_unit_amounts: [100, 2_000, 20_000], 
        items_intervals: ['day', 'month', 'year'],
        status: 'canceled'
      )
      expect(StripeHelpers::DataFetchers).to receive(:get_all_subscriptions)
                                              .once
                                              .with('STUBBED_STRIPE_ACCOUNT_ID')
                                              .and_return([mocked_subscription_1, mocked_subscription_2, mocked_subscription_3])

      num_days_in_this_month = (Time.current.next_month.beginning_of_month - Time.current.beginning_of_month) / (60 * 60 * 24)
      expected_mrr = (10_000) + 
                      (100 * num_days_in_this_month) + 
                      (2_000 * 2) + 
                      (20_000 / 12)
      expect(@metrics_calculator.mrr).to eq(expected_mrr)
      @metrics_calculator.mrr # Call it again to make sure it's cached
    end
  end

  describe '#total_revenue' do
    it 'returns the total revenue of all successful charges for that stripe account' do
      mocked_charge_1 = mocked_stripe_charge(amount: 100_00)
      mocked_charge_2 = mocked_stripe_charge(amount: 200_00)
      mocked_charge_3 = mocked_stripe_charge(amount: 300_00)
      mocked_charge_4 = mocked_stripe_charge(amount: 400_00, status: 'failed')
      expect(StripeHelpers::DataFetchers).to receive(:get_all_charges)
                                              .once
                                              .with('STUBBED_STRIPE_ACCOUNT_ID')
                                              .and_return([mocked_charge_1, mocked_charge_2, mocked_charge_3, mocked_charge_4])

      expect(@metrics_calculator.total_revenue).to eq(600_00)
      @metrics_calculator.total_revenue # Call it again to make sure it's cached
    end
  end

  describe '#mrr_for_subscription' do
    it 'returns the MRR for a specific subscription' do
      mocked_subscription_1 = mocked_stripe_subscription(
        id: 'fake_stripe_subscription_id_1',
        num_items: 1, 
        items_quantities: [1], 
        items_unit_amounts: [10_000], 
        items_intervals: ['month']
      )
      mocked_subscription_2 = mocked_stripe_subscription(
        id: 'fake_stripe_subscription_id_2',
        num_items: 3, 
        items_quantities: [1, 2, 1],
        items_unit_amounts: [100, 2_000, 20_000], 
        items_intervals: ['day', 'month', 'year']
      )
      mocked_subscription_3 = mocked_stripe_subscription(
        id: 'fake_stripe_subscription_id_3',
        num_items: 3, 
        items_quantities: [1, 2, 1],
        items_unit_amounts: [100, 2_000, 20_000], 
        items_intervals: ['day', 'month', 'year'],
        status: 'canceled'
      )
      expect(@metrics_calculator).to receive(:calculate_mrr_for_subscription).with(mocked_subscription_1).once.and_call_original
      expect(@metrics_calculator).to receive(:calculate_mrr_for_subscription).with(mocked_subscription_2).once.and_call_original
      expect(@metrics_calculator).to receive(:calculate_mrr_for_subscription).with(mocked_subscription_3).once.and_call_original

      num_days_in_this_month = (Time.current.next_month.beginning_of_month - Time.current.beginning_of_month) / (60 * 60 * 24)
      expected_mrr_1 = (10_000)
      expected_mrr_2 = (100 * num_days_in_this_month) + 
                        (2_000 * 2) + 
                        (20_000 / 12)
      expected_mrr_3 = 0
      expect(@metrics_calculator.mrr_for_subscription(mocked_subscription_1)).to eq(expected_mrr_1)
      expect(@metrics_calculator.mrr_for_subscription(mocked_subscription_2)).to eq(expected_mrr_2)
      expect(@metrics_calculator.mrr_for_subscription(mocked_subscription_3)).to eq(expected_mrr_3)
      @metrics_calculator.mrr_for_subscription(mocked_subscription_1) # Call it again to make sure it's cached
      @metrics_calculator.mrr_for_subscription(mocked_subscription_2) # Call it again to make sure it's cached
      @metrics_calculator.mrr_for_subscription(mocked_subscription_3) # Call it again to make sure it's cached
    end
  end

  describe '#revenue_for_subscription' do
    it 'returns the lifetime revenue for a specific subscription' do
      mocked_subscription_1 = mocked_stripe_subscription(
        id: 'fake_stripe_subscription_id_1',
        num_items: 1, 
        items_quantities: [1], 
        items_unit_amounts: [10_000], 
        items_intervals: ['month']
      )
      mocked_subscription_2 = mocked_stripe_subscription(
        id: 'fake_stripe_subscription_id_2',
        num_items: 3, 
        items_quantities: [1, 2, 1],
        items_unit_amounts: [100, 2_000, 20_000], 
        items_intervals: ['day', 'month', 'year']
      )
      mocked_subscription_3 = mocked_stripe_subscription(
        id: 'fake_stripe_subscription_id_3',
        num_items: 3, 
        items_quantities: [1, 2, 1],
        items_unit_amounts: [100, 2_000, 20_000], 
        items_intervals: ['day', 'month', 'year'],
        status: 'canceled'
      )
      expect(StripeHelpers::DataFetchers).to receive(:get_all_invoices_for_subscription)
                                                .with('STUBBED_STRIPE_ACCOUNT_ID', 'fake_stripe_subscription_id_1')
                                                .once.and_return([
                                                  mocked_stripe_invoice(amount_paid: 100_000),
                                                  mocked_stripe_invoice(amount_paid: 200_000),
                                                ])
      expect(StripeHelpers::DataFetchers).to receive(:get_all_invoices_for_subscription)
                                                .with('STUBBED_STRIPE_ACCOUNT_ID', 'fake_stripe_subscription_id_2')
                                                .once.and_return([
                                                  mocked_stripe_invoice(amount_paid: 100),
                                                  mocked_stripe_invoice(amount_paid: 200),
                                                ])
      expect(StripeHelpers::DataFetchers).to receive(:get_all_invoices_for_subscription)
                                                .with('STUBBED_STRIPE_ACCOUNT_ID', 'fake_stripe_subscription_id_3')
                                                .once.and_return([
                                                  mocked_stripe_invoice(amount_paid: 1_000_000),
                                                  mocked_stripe_invoice(amount_paid: 2_000_000),
                                                ])
      expect(@metrics_calculator).to receive(:calculate_total_revenue_for_subscription).with(mocked_subscription_1).once.and_call_original
      expect(@metrics_calculator).to receive(:calculate_total_revenue_for_subscription).with(mocked_subscription_2).once.and_call_original
      expect(@metrics_calculator).to receive(:calculate_total_revenue_for_subscription).with(mocked_subscription_3).once.and_call_original

      expect(@metrics_calculator.revenue_for_subscription(mocked_subscription_1)).to eq(300_000)
      expect(@metrics_calculator.revenue_for_subscription(mocked_subscription_2)).to eq(300)
      expect(@metrics_calculator.revenue_for_subscription(mocked_subscription_3)).to eq(3_000_000)
      @metrics_calculator.revenue_for_subscription(mocked_subscription_1) # Call it again to make sure it's cached
      @metrics_calculator.revenue_for_subscription(mocked_subscription_2) # Call it again to make sure it's cached
      @metrics_calculator.revenue_for_subscription(mocked_subscription_3) # Call it again to make sure it's cached
    end
  end

  describe '#total_active_subscriptions' do
    it 'returns the total number of active subscriptions for that stripe account' do
      mocked_subscription_1 = mocked_stripe_subscription(status: 'active')
      mocked_subscription_2 = mocked_stripe_subscription(status: 'active')
      mocked_subscription_3 = mocked_stripe_subscription(status: 'canceled')
      expect(StripeHelpers::DataFetchers).to receive(:get_all_subscriptions)
                                              .once
                                              .with('STUBBED_STRIPE_ACCOUNT_ID')
                                              .and_return([mocked_subscription_1, mocked_subscription_2, mocked_subscription_3])

      expect(@metrics_calculator.total_active_subscriptions).to eq(2)
      @metrics_calculator.total_active_subscriptions # Call it again to make sure it's cached
    end
  end

  describe '#total_free_trial_subscriptions' do
    it 'returns the total number of free trial subscriptions for that stripe account' do
      mocked_subscription_1 = mocked_stripe_subscription(status: 'trialing')
      mocked_subscription_2 = mocked_stripe_subscription(status: 'trialing')
      mocked_subscription_3 = mocked_stripe_subscription(status: 'canceled')
      expect(StripeHelpers::DataFetchers).to receive(:get_all_subscriptions)
                                              .once
                                              .with('STUBBED_STRIPE_ACCOUNT_ID')
                                              .and_return([mocked_subscription_1, mocked_subscription_2, mocked_subscription_3])
      expect(@metrics_calculator).to receive(:calculate_mrr_and_subscription_counts).once.and_call_original
      expect(@metrics_calculator.total_free_trial_subscriptions).to eq(2)
      @metrics_calculator.total_free_trial_subscriptions # Call it again to make sure it's cached
    end
  end

  describe '#total_canceled_subscriptions' do
    it 'returns the total number of canceled subscriptions for that stripe account' do
      mocked_subscription_1 = mocked_stripe_subscription(status: 'canceled')
      mocked_subscription_2 = mocked_stripe_subscription(status: 'canceled')
      mocked_subscription_3 = mocked_stripe_subscription(status: 'active')
      expect(StripeHelpers::DataFetchers).to receive(:get_all_subscriptions)
                                              .once
                                              .with('STUBBED_STRIPE_ACCOUNT_ID')
                                              .and_return([mocked_subscription_1, mocked_subscription_2, mocked_subscription_3])
      expect(@metrics_calculator).to receive(:calculate_mrr_and_subscription_counts).once.and_call_original
      expect(@metrics_calculator.total_canceled_subscriptions).to eq(2)
      @metrics_calculator.total_canceled_subscriptions # Call it again to make sure it's cached
    end
  end
end