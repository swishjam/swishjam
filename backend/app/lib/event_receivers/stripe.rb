module EventReceivers
  class Stripe
    def initialize(request_body, signing_secret)
      @request_body = request_body
      @event_payload = JSON.parse(@request_body)
      @signing_secret = signing_secret
    end

    def receive!
      stripe_event = ::Stripe::Webhook.construct_event(@request_body, @signing_secret, ENV['STRIPE_WEBHOOK_SECRET'])
      return if !stripe_event.livemode
      integration = get_integration_for_stripe_account
      if integration
        public_key = integration.workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.STRIPE)&.public_key
        if public_key
          format_event_data_and_enqueue_it_to_be_processed(stripe_event, integration.workspace, public_key)
          enqueue_supplemental_events_to_be_processed_if_necessary(stripe_event, integration.workspace, public_key)
          enqueue_sync_jobs_if_necessary(stripe_event)
          true
        else
          Sentry.capture_message("Received Stripe event from account #{@event_payload['account']}, but unable to find matching enabled Stripe integration record.")
          false
        end
      else
        Sentry.capture_message("Received Stripe webhook from Stripe account #{@event_payload['account']}, but unable to find matching enabled Stripe integration record.")
        false
      end
    end

    private

    def format_event_data_and_enqueue_it_to_be_processed(stripe_event, workspace, public_key)
      stripe_customer = get_stripe_customer_if_necessary(stripe_event)
      swishjam_event_data = StripeHelpers::WebhookEventParser.event_attributes_for(stripe_event, workspace, stripe_customer)
      formatted_event = Analytics::Event.formatted_for_ingestion(
        uuid: swishjam_event_data['uuid'],
        swishjam_api_key: public_key,
        name: swishjam_event_data['event'],
        occurred_at: Time.at(swishjam_event_data['timestamp'] / 1_000),
        properties: swishjam_event_data.except('uuid', 'event', 'timestamp'),
      )
      Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, [formatted_event])
    end

    def enqueue_supplemental_events_to_be_processed_if_necessary(stripe_event, workspace, public_key)
      if stripe_event.type == 'subscription.updated'
    end

    def enqueue_sync_jobs_if_necessary(stripe_event)
      if %w[customer.subscription.created customer.subscription.updated customer.subscription.deleted].include?(stripe_event.type)
        StripeDataJobs::TryToSyncCustomerSubscriptionFromStripeSubscription.perform_async(stripe_event.data.object.id, @event_payload['account'])
      elsif %w[charge.succeeded charge.refunded].include?(stripe_event.type)
        StripeDataJobs::TryToSyncLifetimeValueFromStripeCharge.perform_async(stripe_event.data.object.id, @event_payload['account'])
      end
    end

    def get_stripe_customer_if_necessary(stripe_event)
      if stripe_event.data.object.respond_to?(:customer) && stripe_event.data.object.customer.is_a?(String) && !ENV['STRIPE_SKIP_CUSTOMER_LOOKUP_IN_WEBHOOKS']
        @stripe_customer ||= ::Stripe::Customer.retrieve(stripe_event.data.object.customer, { stripe_account: @event_payload['account'] })
      end
    end
    
    def get_integration_for_stripe_account
      Integrations::Stripe.includes(:workspace).where("config->>'account_id' = ? AND enabled = ?", @event_payload['account'], true).first
    end
  end
end