require 'spec_helper'

describe Ingestion::EventPreparers::StripeEventHandler do
  def parsed_event(swishjam_api_key:, name: 'some_random_event', timestamp: 10.minutes.ago, properties: {})
    Ingestion::ParsedEventFromIngestion.new({
      'uuid' => 'evt-123',
      'swishjam_api_key' => swishjam_api_key,
      'name' => name,
      'occurred_at' => timestamp.to_f,
      'properties' => properties,
    })
  end

  before do
    @workspace = FactoryBot.create(:workspace)
    @integration = Integrations::Stripe.create!(workspace: @workspace, config: { account_id: 'STUBBED' })
    @public_key = @workspace.api_keys.for_data_source!('stripe').public_key
  end

  describe '#handle_and_return_parsed_events!' do
    it 'associates the event with an existing user if one matches the email address of the Stripe Customer' do
      user_profile = FactoryBot.create(:analytics_user_profile, 
        workspace: @workspace, 
        email: 'jenny@swishjam.com',
        metadata: { birthday: '11/07/1992' }
      )
      
      stripe_customer = mocked_stripe_customer(email: user_profile.email)
      allow(::Stripe::Customer).to receive(:retrieve).with(stripe_customer.id, stripe_account: @integration.account_id).and_return(stripe_customer)

      stripe_event = mocked_stripe_event(
        type: 'charge.succeeded', 
        account: @workspace.integrations.first.account_id,
        object: mocked_stripe_charge(customer: stripe_customer),
      )

      expect(@workspace.analytics_user_profiles.count).to be(1)

      prepared_events = Ingestion::EventPreparers::StripeEventHandler.new(
        parsed_event(swishjam_api_key: @public_key, name: "stripe.#{stripe_event.type}", properties: stripe_event.as_json)
      ).handle_and_return_parsed_events!

      expect(@workspace.analytics_user_profiles.count).to be(1)

      expect(prepared_events.count).to eq(1)
      expect(prepared_events.first.user_profile_id).to eq(user_profile.id)
      
      expect(prepared_events.first.properties['event_id']).to eq(stripe_event.id)
      expect(prepared_events.first.properties['event_type']).to eq(stripe_event.type)
      expect(prepared_events.first.properties['object_type']).to eq(stripe_event.data.object.object)
      expect(prepared_events.first.properties['object_id']).to eq(stripe_event.data.object.id)
      expect(prepared_events.first.properties['amount']).to eq(stripe_event.data.object.amount)
      expect(prepared_events.first.properties['display_amount']).to eq("$#{sprintf('%.2f', stripe_event.data.object.amount / 100.0)}")
      
      expect(prepared_events.first.user_properties['stripe_customer_id']).to eq(stripe_customer.id)
      expect(prepared_events.first.user_properties['stripe_customer_name']).to eq(stripe_customer.name)
      expect(prepared_events.first.user_properties['email']).to eq(user_profile.email)
      expect(prepared_events.first.user_properties['unique_identifier']).to eq(user_profile.user_unique_identifier)
      expect(prepared_events.first.user_properties['birthday']).to eq('11/07/1992')
      
      user_profile.reload
      expect(user_profile.metadata['stripe_customer_id']).to eq(stripe_customer.id)
      expect(user_profile.metadata['stripe_customer_name']).to eq(stripe_customer.name)
      expect(user_profile.metadata['birthday']).to eq('11/07/1992')
    end

    it 'associates the event with a new user if none of the existing users match the email address of the Stripe Customer' do
      existing_user_profile = FactoryBot.create(:analytics_user_profile, workspace: @workspace, email: 'a-different-email@swishjam.com')
      
      stripe_customer = mocked_stripe_customer(email: 'jenny@swishjam.com')
      allow(::Stripe::Customer).to receive(:retrieve).with(stripe_customer.id, stripe_account: @integration.account_id).and_return(stripe_customer)

      stripe_event = mocked_stripe_event(
        type: 'charge.succeeded', 
        account: @workspace.integrations.first.account_id,
        object: mocked_stripe_charge(customer: stripe_customer),
      )

      expect(@workspace.analytics_user_profiles.count).to be(1)

      prepared_events = Ingestion::EventPreparers::StripeEventHandler.new(
        parsed_event(swishjam_api_key: @public_key, name: "stripe.#{stripe_event.type}", properties: stripe_event.as_json)
      ).handle_and_return_parsed_events!

      # THIS IS FLAKY? SOMETIMES IT FAILS CAUSE IT RETURNS 1 FOR SOME REASON??
      expect(@workspace.reload.analytics_user_profiles.count).to be(2)
      new_user_profile = @workspace.analytics_user_profiles.find_by(email: stripe_customer.email)

      expect(prepared_events.count).to eq(1)
      expect(prepared_events.first.user_profile_id).to eq(new_user_profile.id)
      
      expect(prepared_events.first.properties['event_id']).to eq(stripe_event.id)
      expect(prepared_events.first.properties['event_type']).to eq(stripe_event.type)
      expect(prepared_events.first.properties['object_type']).to eq(stripe_event.data.object.object)
      expect(prepared_events.first.properties['object_id']).to eq(stripe_event.data.object.id)
      expect(prepared_events.first.properties['amount']).to eq(stripe_event.data.object.amount)
      expect(prepared_events.first.properties['display_amount']).to eq("$#{sprintf('%.2f', stripe_event.data.object.amount / 100.0)}")
      
      expect(prepared_events.first.user_properties['stripe_customer_id']).to eq(stripe_customer.id)
      expect(prepared_events.first.user_properties['stripe_customer_name']).to eq(stripe_customer.name)
      expect(prepared_events.first.user_properties['email']).to eq(new_user_profile.email)
      expect(prepared_events.first.user_properties['unique_identifier']).to be(nil)
      
      expect(new_user_profile.metadata['stripe_customer_id']).to eq(stripe_customer.id)
      expect(new_user_profile.metadata['stripe_customer_name']).to eq(stripe_customer.name)
    end

    it 'does not associate the event with a user if the Stripe Customer does not have an email address' do
      stripe_event = mocked_stripe_event(
        type: 'charge.succeeded', 
        account: @workspace.integrations.first.account_id,
        object: mocked_stripe_charge(customer: nil, customer_id: nil, customer_name: nil, customer_email: nil),
      )

      prepared_events = Ingestion::EventPreparers::StripeEventHandler.new(
        parsed_event(swishjam_api_key: @public_key, name: "stripe.#{stripe_event.type}", properties: stripe_event.as_json)
      ).handle_and_return_parsed_events!

      expect(@workspace.reload.analytics_user_profiles.count).to be(0)

      expect(prepared_events.count).to eq(1)

      expect(prepared_events.first.user_profile_id).to be(nil)
      expect(prepared_events.first.properties['event_id']).to eq(stripe_event.id)
      expect(prepared_events.first.properties['event_type']).to eq(stripe_event.type)
      expect(prepared_events.first.properties['object_type']).to eq(stripe_event.data.object.object)
      expect(prepared_events.first.properties['object_id']).to eq(stripe_event.data.object.id)
      expect(prepared_events.first.properties['amount']).to eq(stripe_event.data.object.amount)
      expect(prepared_events.first.properties['display_amount']).to eq("$#{sprintf('%.2f', stripe_event.data.object.amount / 100.0)}")
      expect(prepared_events.first.user_properties.keys.count).to be(0)
    end

    it 'returns multiple parsed events when the SupplementalEvents::Evaluator returns any matches' do
      stripe_event = mocked_stripe_event(
        type: 'charge.succeeded', 
        account: @workspace.integrations.first.account_id,
        object: mocked_stripe_charge(customer: nil, customer_id: nil, customer_name: nil, customer_email: nil),
      )

      expect(StripeHelpers::SupplementalEvents::Evaluator).to receive(:new).exactly(1).times.and_call_original
      expect_any_instance_of(StripeHelpers::SupplementalEvents::Evaluator).to receive(:parsed_events_for_any_matching_supplemental_events).exactly(1).times.and_return(
        # we're not testing the functionality of the evaluator here, so we'll just return a random event
        [parsed_event(swishjam_api_key: @public_key, name: 'stripe.supplemental.subscription.created', properties: { 'some' => 'properties' })],
      )

      prepared_events = Ingestion::EventPreparers::StripeEventHandler.new(
        parsed_event(swishjam_api_key: @public_key, name: "stripe.#{stripe_event.type}", properties: stripe_event.as_json)
      ).handle_and_return_parsed_events!

      expect(prepared_events.count).to eq(2)
      expect(prepared_events.first.name).to eq('stripe.charge.succeeded')
      expect(prepared_events.last.name).to eq('stripe.supplemental.subscription.created')
    end
  end
end