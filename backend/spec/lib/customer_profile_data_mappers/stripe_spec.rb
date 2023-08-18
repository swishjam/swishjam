require 'spec_helper'

describe CustomerProfileDataMappers::Stripe do
  before do
    setup_test_data
    @mapper = CustomerProfileDataMappers::Stripe.new(@swishjam_organization)
  end

  describe '#find_or_create_owner' do
    it 'returns an existing organization if one is found with matching metadata for the stripe customer id' do
      stripe_customer = mocked_stripe_customer
      org = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization)
      expect(@mapper).to receive(:find_organization_by_metadata)
                          .with(['stripe_customer_id', 'stripe customer id', 'stripe_customer', 'stripe customer'], stripe_customer.id)
                          .and_return(org)
      expect(@mapper).to_not receive(:find_organization_by_domain)
      expect(@mapper).to_not receive(:find_organization_by_name)
      expect(@mapper).to_not receive(:create_new_organization_and_user_from_stripe_customer)
      expect(@swishjam_organization.analytics_organizations.count).to be(1)
      expect(@mapper.find_or_create_owner(stripe_customer)).to eq(org)
      expect(@swishjam_organization.analytics_organizations.count).to be(1)
    end

    it 'returns an existing organization if one is found with matching domain for the stripe customer email' do
      stripe_customer = mocked_stripe_customer
      org = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization)
      expect(@mapper).to receive(:find_organization_by_metadata)
                          .with(['stripe_customer_id', 'stripe customer id', 'stripe_customer', 'stripe customer'], stripe_customer.id)
                          .and_return(nil)
      expect(@mapper).to receive(:find_organization_by_domain).with(stripe_customer.email.split('@').dig(1)).and_return(org)
      expect(@mapper).to_not receive(:find_organization_by_name)
      expect(@mapper).to_not receive(:create_new_organization_and_user_from_stripe_customer)
      expect(@swishjam_organization.analytics_organizations.count).to be(1)
      expect(@mapper.find_or_create_owner(stripe_customer)).to eq(org)
      expect(@swishjam_organization.analytics_organizations.count).to be(1)
    end

    it 'returns an existing organization if one is found with a matching name' do
      stripe_customer = mocked_stripe_customer
      org = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization)
      expect(@mapper).to receive(:find_organization_by_metadata)
                          .with(['stripe_customer_id', 'stripe customer id', 'stripe_customer', 'stripe customer'], stripe_customer.id)
                          .and_return(nil)
      expect(@mapper).to receive(:find_organization_by_domain).with(stripe_customer.email.split('@').dig(1)).and_return(org).and_return(nil)
      expect(@mapper).to receive(:find_organization_by_name).with(stripe_customer.name).and_return(org)
      expect(@mapper).to_not receive(:create_new_organization_and_user_from_stripe_customer)
      expect(@swishjam_organization.analytics_organizations.count).to be(1)
      expect(@mapper.find_or_create_owner(stripe_customer)).to eq(org)
      expect(@swishjam_organization.analytics_organizations.count).to be(1)
    end

    it 'creates a new organization and user if no existing organization is found' do
      stripe_customer = mocked_stripe_customer(email: 'johnny@appleseed.com', name: 'Johnny Appleseed')
      expect(@mapper).to receive(:find_organization_by_metadata)
                          .with(['stripe_customer_id', 'stripe customer id', 'stripe_customer', 'stripe customer'], stripe_customer.id)
                          .and_return(nil)
      expect(@mapper).to receive(:find_organization_by_domain).with(stripe_customer.email.split('@').dig(1)).and_return(nil)
      expect(@mapper).to receive(:find_organization_by_name).with(stripe_customer.name).and_return(nil)
      expect(@mapper).to receive(:create_new_organization_and_user_from_stripe_customer).with(stripe_customer).and_call_original
      expect(@swishjam_organization.analytics_organizations.count).to be(0)
      expect(@swishjam_organization.analytics_users.count).to be(0)

      new_org = @mapper.find_or_create_owner(stripe_customer)
      
      expect(new_org.name).to eq(stripe_customer.name)
      expect(new_org.url).to eq('appleseed.com')
      expect(new_org.metadata.formatted['stripe_customer_id']).to eq(stripe_customer.id)
      expect(new_org.metadata.formatted['created_by']).to eq('stripe')
      expect(new_org.users.count).to be(1)
      expect(new_org.users.first.email).to eq(stripe_customer.email)
      expect(new_org.users.first.first_name).to eq('Johnny')
      expect(new_org.users.first.last_name).to eq('Appleseed')
    end
  end
end