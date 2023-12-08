require 'spec_helper'

RSpec.describe EventReceivers::Stripe do
  describe '#receive!' do
    it 'parses the event payload and enqueues the event for ingestion' do
      workspace = create(:workspace)
      stripe_integration = create(:stripe_integration, workspace: workspace, config: { account_id: 'acct_xyz_fake' })
      event_occurred_at = 10.minutes.ago.to_i
      event_payload = {
        'id' => 'evt_1',
        'type' => 'customer.subscription.created',
        'account' => 'acct_xyz_fake',
        'created' => event_occurred_at,
        'data' => {
          'object' => {
            'id' => 'sub_1',
            'customer' => 'cus_1',
            'metadata' => { 'metadata_1' => 'some_kind_of_metadata_value' },
            'items' => {
              'data' => [
                {
                  'id' => 'si_1',
                  'quantity' => 1,
                  'price' => {
                    'id' => 'price_1',
                    'product' => 'prod_1',
                    'unit_amount' => 100,
                    'nickname' => 'Monthly',
                    'billing_scheme' => 'per_unit',
                    'recurring' => {
                      'interval' => 'month',
                      'interval_count' => 1,
                      'usage_type' => 'licensed',
                    },
                  },
                },
              ],
            },
          },
        },
      }.with_indifferent_access
      existing_user = create(:analytics_user_profile, workspace: workspace, email: 'jenny.rosen@gmail.com')

      expect(Stripe::Webhook).to receive(:construct_event).with(event_payload, 'FAKE_SIGNING_SECRET', ENV['STRIPE_WEBHOOK_SECRET']).and_return(Stripe::Event.construct_from(event_payload)).once
      expect(Stripe::Customer).to receive(:retrieve).with('cus_1', { stripe_account: 'acct_xyz_fake' }).and_return(Stripe::Customer.construct_from({ 'id' => 'cus_1', 'email' => 'jenny.rosen@gmail.com', 'name' => 'Jenny Rosen', 'metadata' => { 'some_customer_metadata' => 'some_customer_metadata_value!' } })).once
      expect(Ingestion::QueueManager).to receive(:push_records_into_queue).with(
        Ingestion::QueueManager::Queues.EVENTS, 
        [Analytics::Event.formatted_for_ingestion(
          uuid: 'evt_1',
          swishjam_api_key: workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.STRIPE).public_key,
          name: 'stripe.customer.subscription.created',
          occurred_at: Time.at(event_occurred_at),
          # the order of the properties actually matter here, so we need to make sure they're in the right order
          properties: {
            'object_id' => 'sub_1',
            'amount' => 100,
            'products' => 'prod_1',
            'metadata_metadata_1' => 'some_kind_of_metadata_value',
            'user_profile_id' => existing_user.id,
            'customer_email' => 'jenny.rosen@gmail.com',
            'customer_id' => 'cus_1',
            'customer_metadata_some_customer_metadata' => 'some_customer_metadata_value!',
          }
        )]
      ).once
      EventReceivers::Stripe.new(event_payload, 'FAKE_SIGNING_SECRET').receive!
    end

    it 'creates a new user if one does not yet exist for the stripe customer email' do
      workspace = create(:workspace)
      stripe_integration = create(:stripe_integration, workspace: workspace, config: { account_id: 'acct_xyz_fake' })
      event_occurred_at = 10.minutes.ago.to_i
      event_payload = {
        'id' => 'evt_1',
        'type' => 'customer.subscription.created',
        'account' => 'acct_xyz_fake',
        'created' => event_occurred_at,
        'data' => {
          'object' => {
            'id' => 'sub_1',
            'customer' => 'cus_1',
            'metadata' => { 'metadata_1' => 'some_kind_of_metadata_value' },
            'items' => {
              'data' => [
                {
                  'id' => 'si_1',
                  'quantity' => 1,
                  'price' => {
                    'id' => 'price_1',
                    'product' => 'prod_1',
                    'unit_amount' => 100,
                    'nickname' => 'Monthly',
                    'billing_scheme' => 'per_unit',
                    'recurring' => {
                      'interval' => 'month',
                      'interval_count' => 1,
                      'usage_type' => 'licensed',
                    },
                  },
                },
              ],
            },
          },
        },
      }.with_indifferent_access

      # these tests fail when out of order and without this line, ugh, DB is not cleaned up properly
      AnalyticsUserProfile.destroy_all

      expect(Stripe::Webhook).to receive(:construct_event).with(event_payload, 'FAKE_SIGNING_SECRET', ENV['STRIPE_WEBHOOK_SECRET']).and_return(Stripe::Event.construct_from(event_payload)).once
      expect(Stripe::Customer).to receive(:retrieve).with('cus_1', { stripe_account: 'acct_xyz_fake' }).and_return(Stripe::Customer.construct_from({ 'id' => 'cus_1', 'email' => 'jenny.rosen@gmail.com', 'name' => 'Jenny Rosen', 'metadata' => { 'some_customer_metadata' => 'some_customer_metadata_value!' } })).once
      expect(AnalyticsUserProfile.all.reload.count).to be(0)

      EventReceivers::Stripe.new(event_payload, 'FAKE_SIGNING_SECRET').receive!

      expect(AnalyticsUserProfile.count).to be(1)
      expect(AnalyticsUserProfile.first.email).to eq('jenny.rosen@gmail.com')
      expect(AnalyticsUserProfile.first.first_name).to eq('Jenny')
      expect(AnalyticsUserProfile.first.last_name).to eq('Rosen')
      expect(AnalyticsUserProfile.first.created_by_data_source).to eq(ApiKey::ReservedDataSources.STRIPE)
    end
  end
end