require 'spec_helper'

RSpec.describe EventReceivers::Stripe do
  describe '#receive!' do
    it 'parses the event payload and enqueues the event for ingestion' do
      workspace = create(:workspace)
      stripe_integration = create(:stripe_integration, workspace: workspace, config: { account_id: 'acct_xyz_fake' })
      event_occurred_at = 10.minutes.ago.to_i
      request_payload = {
        'id' => 'evt_1',
        'type' => 'customer.subscription.created',
        'account' => 'acct_xyz_fake',
        'created' => event_occurred_at,
        'livemode' => true,
        'data' => {
          'object' => {
            'id' => 'sub_1',
            'customer' => 'cus_1',
            'metadata' => { 'metadata_1' => 'some_kind_of_metadata_value' },
            'status' => 'active',
            'canceled_at' => nil,
            'items' => Stripe::ListObject.construct_from({
              'object' => 'list',
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
            }),
          },
        },
      }.to_json
      expect(Stripe::Webhook).to receive(:construct_event).with(request_payload, 'FAKE_SIGNING_SECRET', ENV['STRIPE_WEBHOOK_SECRET']).and_return(Stripe::Event.construct_from(JSON.parse(request_payload))).once
      
      existing_user = create(:analytics_user_profile, workspace: workspace, email: 'jenny.rosen@gmail.com')

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
            'mrr' => 100,
            'products' => 'prod_1',
            'metadata_metadata_1' => 'some_kind_of_metadata_value',
            'customer_email' => 'jenny.rosen@gmail.com',
            'customer_id' => 'cus_1',
            'customer_metadata_some_customer_metadata' => 'some_customer_metadata_value!',
            'user_profile_id' => existing_user.id,
          }
        )]
      ).once
      EventReceivers::Stripe.new(request_payload, 'FAKE_SIGNING_SECRET').receive!
    end

    it 'creates a new user if one does not yet exist for the stripe customer email' do
      workspace = create(:workspace)
      stripe_integration = create(:stripe_integration, workspace: workspace, config: { account_id: 'acct_xyz_fake' })
      event_occurred_at = 10.minutes.ago.to_i
      request_payload = {
        'id' => 'evt_1',
        'type' => 'customer.subscription.created',
        'account' => 'acct_xyz_fake',
        'created' => event_occurred_at,
        'livemode' => true,
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
      }.to_json

      # these tests fail when out of order and without this line, ugh, DB is not cleaned up properly
      AnalyticsUserProfile.destroy_all

      expect(Stripe::Webhook).to receive(:construct_event).with(request_payload, 'FAKE_SIGNING_SECRET', ENV['STRIPE_WEBHOOK_SECRET']).and_return(Stripe::Event.construct_from(JSON.parse(request_payload))).once
      expect(Stripe::Customer).to receive(:retrieve).with('cus_1', { stripe_account: 'acct_xyz_fake' }).and_return(Stripe::Customer.construct_from({ 'id' => 'cus_1', 'email' => 'jenny.rosen@gmail.com', 'name' => 'Jenny Rosen', 'metadata' => { 'some_customer_metadata' => 'some_customer_metadata_value!' } })).once
      expect(AnalyticsUserProfile.all.reload.count).to be(0)

      EventReceivers::Stripe.new(request_payload, 'FAKE_SIGNING_SECRET').receive!

      expect(AnalyticsUserProfile.count).to be(1)
      expect(AnalyticsUserProfile.first.email).to eq('jenny.rosen@gmail.com')
      expect(AnalyticsUserProfile.first.first_name).to eq('Jenny')
      expect(AnalyticsUserProfile.first.last_name).to eq('Rosen')
      expect(AnalyticsUserProfile.first.created_by_data_source).to eq(ApiKey::ReservedDataSources.STRIPE)
    end

    it 'includes supplemental events if criteria is met' do
      Workspace.destroy_all # SO DUMB! why doesn't the DB get cleaned up properly between tests?!
      
      workspace = create(:workspace)
      stripe_integration = create(:stripe_integration, workspace: workspace, config: { account_id: 'acct_xyz_fake' })
      event_occurred_at = 10.minutes.ago.to_i
      request_payload = {
        'id' => 'evt_1',
        'type' => 'customer.subscription.updated',
        'account' => 'acct_xyz_fake',
        'created' => event_occurred_at,
        'livemode' => true,
        'data' => {
          'previous_attributes' => {
            'status' => 'active',
          },
          'object' => {
            'id' => 'sub_1',
            'customer' => 'cus_1',
            'metadata' => { 'metadata_1' => 'some_kind_of_metadata_value' },
            'status' => 'canceled',
            'canceled_at' => event_occurred_at,
            'cancellation_details' => {
              'comment' => 'some kind of comment',
              'reason' => 'some kind of reason',
              'feedback' => 'some kind of feedback',
            },
            'items' => Stripe::ListObject.construct_from({
              'object' => 'list',
              'data' => [{
                'id' => 'si_1',
                'quantity' => 1,
                'price' => Stripe::Price.construct_from({
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
                }),
              }],
            }),
          },
        },
      }.to_json
      existing_user = create(:analytics_user_profile, workspace: workspace, email: 'jenny.rosen@gmail.com')

      expect(Stripe::Webhook).to receive(:construct_event).with(request_payload, 'FAKE_SIGNING_SECRET', ENV['STRIPE_WEBHOOK_SECRET']).and_return(Stripe::Event.construct_from(JSON.parse(request_payload))).once
      expect(Stripe::Customer).to receive(:retrieve).with('cus_1', { stripe_account: 'acct_xyz_fake' }).and_return(Stripe::Customer.construct_from({ 'id' => 'cus_1', 'email' => 'jenny.rosen@gmail.com', 'name' => 'Jenny Rosen', 'metadata' => { 'some_customer_metadata' => 'some_customer_metadata_value!' } })).once
      expect(Stripe::Subscription).to receive(:list)
                                      .with({ customer: 'cus_1' }, stripe_account: 'acct_xyz_fake')
                                      .and_return(
                                        Stripe::ListObject.construct_from({ 
                                          'data' => [Stripe::Subscription.construct_from({
                                            'id' => 'sub_1',
                                            'status' => 'canceled',
                                            'canceled_at' => event_occurred_at,
                                            'items' => Stripe::ListObject.construct_from({
                                              'object' => 'list',
                                              'data' => [
                                                Stripe::SubscriptionItem.construct_from({
                                                  'id' => 'si_1',
                                                  'quantity' => 1,
                                                  'price' => Stripe::Price.construct_from({
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
                                                  }),
                                                }),
                                              ],
                                            }),
                                          })] 
                                        })
                                      ).once

      public_key = workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.STRIPE).public_key
      expected_default_stripe_event = Analytics::Event.formatted_for_ingestion(
        uuid: 'evt_1',
        swishjam_api_key: public_key,
        name: 'stripe.customer.subscription.updated',
        occurred_at: Time.at(event_occurred_at),
        # the order of the properties actually matter here, so we need to make sure they're in the right order
        properties: {
          'object_id' => 'sub_1',
          'metadata_metadata_1' => 'some_kind_of_metadata_value',
          'customer_email' => 'jenny.rosen@gmail.com',
          'customer_id' => 'cus_1',
          'customer_metadata_some_customer_metadata' => 'some_customer_metadata_value!',
          'user_profile_id' => existing_user.id,
        }
      )
      expected_supplemental_stripe_subscription_churned_event = Analytics::Event.formatted_for_ingestion(
        uuid: 'evt_1-subscription-churned',
        swishjam_api_key: public_key,
        name: 'stripe.supplemental.subscription.churned',
        occurred_at: Time.at(event_occurred_at),
        properties: {
          'stripe_subscription_id' => 'sub_1',
          'stripe_customer_id' => 'cus_1',
          'stripe_customer_email' => 'jenny.rosen@gmail.com',
          'mrr' => 100,
          'cancellation_comment' => 'some kind of comment',
          'cancellation_feedback' => 'some kind of feedback',
          'cancellation_reason' => 'some kind of reason',
          'user_profile_id' => existing_user.id,
        }
      )
      expected_supplemental_stripe_customer_churned_event = Analytics::Event.formatted_for_ingestion(
        uuid: 'evt_1-customer-churned',
        swishjam_api_key: public_key,
        name: 'stripe.supplemental.customer.churned',
        occurred_at: Time.at(event_occurred_at),
        properties: {
          'stripe_subscription_id' => 'sub_1',
          'stripe_customer_id' => 'cus_1',
          'stripe_customer_email' => 'jenny.rosen@gmail.com',
          'mrr' => 100,
          'cancellation_comment' => 'some kind of comment',
          'cancellation_feedback' => 'some kind of feedback',
          'cancellation_reason' => 'some kind of reason',
          'user_profile_id' => existing_user.id,
        }
      )
      expect(Ingestion::QueueManager).to receive(:push_records_into_queue).with(
        Ingestion::QueueManager::Queues.EVENTS, 
        [expected_default_stripe_event, expected_supplemental_stripe_subscription_churned_event, expected_supplemental_stripe_customer_churned_event]
      ).once
      EventReceivers::Stripe.new(request_payload, 'FAKE_SIGNING_SECRET').receive!
    end
  end
end