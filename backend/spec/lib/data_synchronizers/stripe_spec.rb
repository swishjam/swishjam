require 'spec_helper'

describe DataSynchronizers::Stripe do
  before do
    setup_test_data
    stub_external_apis
    integration = FactoryBot.create(:stripe_integration, organization: @swishjam_organization)
    @synchronizer = DataSynchronizers::Stripe.new(@swishjam_organization, integration.account_id)
  end

  describe '#sync!' do
    it 'creates a new `billing_data_snapshot`' do
      expect(@synchronizer.instance_variable_get(:@stripe_metrics)).to receive(:mrr).and_return(100_000)
      expect(@synchronizer.instance_variable_get(:@stripe_metrics)).to receive(:total_revenue).and_return(1_000_000)
      expect(@synchronizer.instance_variable_get(:@stripe_metrics)).to receive(:total_active_subscriptions).and_return(100)
      expect(@synchronizer.instance_variable_get(:@stripe_metrics)).to receive(:total_free_trial_subscriptions).and_return(50)
      expect(@synchronizer.instance_variable_get(:@stripe_metrics)).to receive(:total_canceled_subscriptions).and_return(10)
      expect(Analytics::BillingDataSnapshot.count).to be(0)

      @synchronizer.sync!

      expect(Analytics::BillingDataSnapshot.count).to be(1)
      snapshot = Analytics::BillingDataSnapshot.last
      expect(snapshot.mrr_in_cents).to be(100_000)
      expect(snapshot.total_revenue_in_cents).to be(1_000_000)
      expect(snapshot.num_active_subscriptions).to be(100)
      expect(snapshot.num_free_trial_subscriptions).to be(50)
      expect(snapshot.num_canceled_subscriptions).to be(10)
    end

    it 'creates a new `customer_billing_data_snapshot` for each subscription' do
      mocked_stripe_subscription_1 = mocked_stripe_subscription(items_unit_amounts: [1_000])
      mocked_stripe_subscription_2 = mocked_stripe_subscription(items_unit_amounts: [2_000])
      expect(@synchronizer.instance_variable_get(:@stripe_metrics)).to receive(:subscriptions).at_least(:once).and_return([mocked_stripe_subscription_1, mocked_stripe_subscription_2])
      expect(@synchronizer.instance_variable_get(:@stripe_metrics)).to receive(:mrr_for_subscription).with(mocked_stripe_subscription_1).and_return(1_000)
      expect(@synchronizer.instance_variable_get(:@stripe_metrics)).to receive(:mrr_for_subscription).with(mocked_stripe_subscription_2).and_return(2_000)
      expect(@synchronizer.instance_variable_get(:@stripe_metrics)).to receive(:revenue_for_subscription).with(mocked_stripe_subscription_1).and_return(10_000)
      expect(@synchronizer.instance_variable_get(:@stripe_metrics)).to receive(:revenue_for_subscription).with(mocked_stripe_subscription_2).and_return(20_000)
      expect(@swishjam_organization.analytics_customer_billing_data_snapshots.count).to be(0)

      @synchronizer.sync!

      expect(@swishjam_organization.analytics_customer_billing_data_snapshots.count).to be(2)
      expect(@swishjam_organization.analytics_customer_billing_data_snapshots.collect(&:mrr_in_cents)).to match_array([1_000, 2_000])
      expect(@swishjam_organization.analytics_customer_billing_data_snapshots.collect(&:total_revenue_in_cents)).to match_array([10_000, 20_000])
      expect(@swishjam_organization.analytics_customer_billing_data_snapshots.collect(&:customer_email)).to match_array([mocked_stripe_subscription_1.customer.email, mocked_stripe_subscription_2.customer.email])
      expect(@swishjam_organization.analytics_customer_billing_data_snapshots.collect(&:customer_name)).to match_array([mocked_stripe_subscription_1.customer.name, mocked_stripe_subscription_2.customer.name])
      expect(@swishjam_organization.analytics_customer_billing_data_snapshots.collect(&:owner).any?(&:nil?)).to be(false)
    end

    it 'creates a `customer_subscription` if one does not exist' do
      mocked_stripe_subscription = mocked_stripe_subscription(items_unit_amounts: [1_000])
      expect(@synchronizer.instance_variable_get(:@stripe_metrics)).to receive(:subscriptions).at_least(:once).and_return([mocked_stripe_subscription])
      expect(@swishjam_organization.analytics_customer_subscriptions.count).to be(0)

      @synchronizer.sync!

      expect(@swishjam_organization.analytics_customer_subscriptions.count).to be(1)
      subscription = @swishjam_organization.analytics_customer_subscriptions.last
      expect(subscription.swishjam_organization).to eq(@swishjam_organization)
      expect(subscription.provider_id).to eq(mocked_stripe_subscription.id)
      expect(subscription.status).to eq(mocked_stripe_subscription.status)
      expect(subscription.started_at).to eq(Time.at(mocked_stripe_subscription.created))
      # TODO: running into millisecond precision issues here I think
      # expect(subscription.next_charge_runs_at).to eq(Time.at(mocked_stripe_subscription.current_period_end))
      expect(subscription.ends_at).to eq(nil)
      expect(subscription.free_trial_starts_at).to eq(nil)
      expect(subscription.free_trial_ends_at).to eq(nil)
      expect(subscription.subscription_items.count).to be(1)
      expect(subscription.subscription_items.first.quantity).to eq(1)
      expect(subscription.subscription_items.first.unit_amount_in_cents).to eq(1_000)
      expect(subscription.subscription_items.first.interval).to eq('month')
      expect(subscription.subscription_items.first.plan_name).to eq('fake_stripe_product_name')
      expect(subscription.owner).to_not be(nil)
    end

    it 'updates an existing `customer_subscription` if one exists' do
      customer_subscription = FactoryBot.create(:analytics_customer_subscription,
        swishjam_organization: @swishjam_organization,
        provider_id: 'fake_stripe_subscription_id',
        subscription_items_attributes: [{ quantity: 1, unit_amount_in_cents: 1_000, interval: 'month', plan_name: 'fake_stripe_product_name' }]
      )
      mocked_stripe_subscription = mocked_stripe_subscription(id: customer_subscription.provider_id, items_unit_amounts: [1_000_000])
      expect(@synchronizer.instance_variable_get(:@stripe_metrics)).to receive(:subscriptions).at_least(:once).and_return([mocked_stripe_subscription])
      
      expect(@swishjam_organization.analytics_customer_subscriptions.count).to be(1)
      expect(@swishjam_organization.analytics_customer_subscriptions.first).to eq(customer_subscription)
      
      @synchronizer.sync!

      expect(@swishjam_organization.analytics_customer_subscriptions.count).to be(1)
      subscription = @swishjam_organization.analytics_customer_subscriptions.last
      expect(subscription.id).to eq(customer_subscription.id)
      expect(subscription.provider_id).to eq(mocked_stripe_subscription.id)
      expect(subscription.status).to eq(mocked_stripe_subscription.status)
      expect(subscription.subscription_items.count).to be(1)
      expect(subscription.subscription_items.first.unit_amount_in_cents).to eq(1_000_000)
      expect(subscription.owner).to_not be(nil)
    end

    it 'creates a new `payment` if one does not exist' do
      stripe_charge = mocked_stripe_charge
      expect(@synchronizer.instance_variable_get(:@stripe_metrics)).to receive(:charges).at_least(:once).and_return([stripe_charge])
      expect(@swishjam_organization.analytics_customer_payments.count).to be(0)

      @synchronizer.sync!

      expect(@swishjam_organization.analytics_customer_payments.count).to be(1)
      payment = @swishjam_organization.analytics_customer_payments.last
      expect(payment.swishjam_organization).to eq(@swishjam_organization)
      expect(payment.payment_processor).to eq('stripe')
      expect(payment.provider_id).to eq(stripe_charge.id)
      expect(payment.customer_email).to eq(stripe_charge.customer.email)
      expect(payment.customer_name).to eq(stripe_charge.customer.name)
      expect(payment.amount_in_cents).to eq(stripe_charge.amount)
      expect(payment.charged_at).to eq(Time.at(stripe_charge.created))
      expect(payment.status).to eq(stripe_charge.status)
      expect(payment.owner).to_not be(nil)
    end

    it 'updates an existing `payment` if one exists' do
      existing_payment = FactoryBot.create(:analytics_customer_payment, 
        amount_in_cents: 100, 
        swishjam_organization: @swishjam_organization, 
        provider_id: 'fake_stripe_charge_id',
      )
      stripe_charge = mocked_stripe_charge(id: existing_payment.provider_id, amount: 1_000_000)
      expect(@synchronizer.instance_variable_get(:@stripe_metrics)).to receive(:charges).at_least(:once).and_return([stripe_charge])
      expect(@swishjam_organization.analytics_customer_payments.count).to be(1)

      @synchronizer.sync!

      expect(@swishjam_organization.analytics_customer_payments.count).to be(1)
      payment = @swishjam_organization.analytics_customer_payments.last
      expect(payment.id).to eq(existing_payment.id)
      expect(payment.provider_id).to eq(stripe_charge.id)
      expect(payment.amount_in_cents).to eq(stripe_charge.amount)
      expect(payment.owner).to_not be(nil)
    end

    it 'creates a new_billing_data_snapshot' do
      expect(@swishjam_organization.analytics_billing_data_snapshots.count).to eq(0)
      
      @synchronizer.sync!

      expect(@swishjam_organization.analytics_billing_data_snapshots.count).to eq(1)
      snapshot = @swishjam_organization.analytics_billing_data_snapshots.first
      expect(snapshot.mrr_in_cents).to eq(1_000)
      expect(snapshot.total_revenue_in_cents).to eq(1_000)
      expect(snapshot.num_active_subscriptions).to eq(1)
      expect(snapshot.num_free_trial_subscriptions).to eq(0)
      expect(snapshot.num_canceled_subscriptions).to eq(0)
    end

    it 'creates a new customer_billing_data_snapshot for each customer and creates a new user and organization (owner) if unable to find a match' do
      expect(Analytics::CustomerBillingDataSnapshot.count).to eq(0)
      expect(Analytics::User.count).to eq(0)
      expect(Analytics::Organization.count).to eq(0)

      @synchronizer.sync!

      expect(Analytics::CustomerBillingDataSnapshot.count).to eq(1)
      expect(Analytics::User.count).to eq(1)
      expect(Analytics::Organization.count).to eq(1)
      customer_snapshot = Analytics::CustomerBillingDataSnapshot.first
      expect(customer_snapshot.owner).to eq(Analytics::Organization.first)
      expect(customer_snapshot.owner.name).to eq('Fake Name') # from stub_external_apis
      expect(customer_snapshot.owner.url).to eq('example.com') # from stub_external_apis
      expect(customer_snapshot.owner.users.count).to eq(1)
      expect(customer_snapshot.owner.users.first.email).to eq('fake@example.com') # from stub_external_apis
      expect(customer_snapshot.owner.users.first.first_name).to eq('Fake') # from stub_external_apis
      expect(customer_snapshot.owner.users.first.last_name).to eq('Name') # from stub_external_apis
    end

    it 'associates the new billing_data_snapshot with an existing organization if one exists with metadata containing the stripe_customer_id' do
      organization = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization)
      FactoryBot.create(:organization_metadata, parent: organization, key: 'stripe_customer_id', value: 'fake_stripe_customer_id')
      expect(Analytics::CustomerBillingDataSnapshot.count).to eq(0)
      expect(Analytics::User.count).to eq(0)
      expect(Analytics::Organization.count).to eq(1)

      @synchronizer.sync!

      expect(Analytics::CustomerBillingDataSnapshot.count).to eq(1)
      expect(Analytics::User.count).to eq(0)
      expect(Analytics::Organization.count).to eq(1)
      customer_snapshot = Analytics::CustomerBillingDataSnapshot.first
      expect(customer_snapshot.owner).to eq(organization)
    end

    it 'associates the new billing_data_snapshot with an existing organization if one exists with a matching url from the stripe customer email' do
      organization = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization, url: 'www.example.com')
      expect(Analytics::CustomerBillingDataSnapshot.count).to eq(0)
      expect(Analytics::User.count).to eq(0)
      expect(Analytics::Organization.count).to eq(1)

      @synchronizer.sync!

      expect(Analytics::CustomerBillingDataSnapshot.count).to eq(1)
      expect(Analytics::User.count).to eq(0)
      expect(Analytics::Organization.count).to eq(1)
      customer_snapshot = Analytics::CustomerBillingDataSnapshot.first
      expect(customer_snapshot.owner).to eq(organization)
    end

    it 'associates the new billing_data_snapshot with an existing organization if one exists with a matching name from the stripe customer name' do
      organization = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization, name: 'Fake Name')
      expect(Analytics::CustomerBillingDataSnapshot.count).to eq(0)
      expect(Analytics::User.count).to eq(0)
      expect(Analytics::Organization.count).to eq(1)

      @synchronizer.sync!

      expect(Analytics::CustomerBillingDataSnapshot.count).to eq(1)
      expect(Analytics::User.count).to eq(0)
      expect(Analytics::Organization.count).to eq(1)
      customer_snapshot = Analytics::CustomerBillingDataSnapshot.first
      expect(customer_snapshot.owner).to eq(organization)
    end
  end
end