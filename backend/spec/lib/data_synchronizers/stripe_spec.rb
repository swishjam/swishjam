require 'spec_helper'

describe DataSynchronizers::Stripe do
  before do
    setup_test_data
    stub_external_apis
    integration = FactoryBot.create(:stripe_integration, organization: @swishjam_organization)
    @synchronizer = DataSynchronizers::Stripe.new(@swishjam_organization, integration.account_id)
  end

  describe '#sync!' do
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