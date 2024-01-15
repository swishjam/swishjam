module EventReceivers
  class Stripe
    def initialize(request_body, signing_secret)
      @request_body = request_body
      @event_payload = JSON.parse(@request_body)
      @stripe_event = ::Stripe::Webhook.construct_event(request_body, signing_secret, ENV['STRIPE_WEBHOOK_SECRET'])
      @event_parser = StripeHelpers::WebhookEventParser.new(@stripe_event, workspace, stripe_customer)
    end

    def receive!
      return if !@stripe_event.livemode
      if integration.nil?
        if public_key
          supplemental_events = StripeHelpers::SupplementalEvents::Evaluator.new(
            stripe_event: @stripe_event, 
            stripe_customer: stripe_customer, 
            public_key: public_key, 
            maybe_user_profile_id: @event_parser.maybe_user_profile&.id,
          ).format_supplemental_events_to_be_processed_if_necessary!
          
          [formatted_event_to_ingest].concat(supplemental_events)

          Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, events) if events.any?
          enqueue_sync_jobs_if_necessary!
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

    def integration
      @integration ||= Integrations::Stripe.includes(:workspace).enabled.find_by_config_attribute("account_id", @event_payload['account'])
    end

    def workspace
      @workspace ||= integration.workspace
    end

    def public_key
      @public_key ||= workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.STRIPE)&.public_key
    end

    def stripe_customer
      if @stripe_event.data.object.respond_to?(:customer) && @stripe_event.data.object.customer.is_a?(String) && !ENV['STRIPE_SKIP_CUSTOMER_LOOKUP_IN_WEBHOOKS']
        @stripe_customer ||= ::Stripe::Customer.retrieve(@stripe_event.data.object.customer, { stripe_account: @event_payload['account'] })
      end
    end

    def formatted_event_to_ingest
      swishjam_event_data = @event_parser.formatted_event_data
      Analytics::Event.formatted_for_ingestion(
        uuid: swishjam_event_data['uuid'],
        swishjam_api_key: public_key,
        name: swishjam_event_data['event'],
        occurred_at: Time.at(swishjam_event_data['timestamp']),
        properties: swishjam_event_data.except('uuid', 'event', 'timestamp'),
      )
    end

    def enqueue_sync_jobs_if_necessary!
      if %w[customer.subscription.created customer.subscription.updated customer.subscription.deleted].include?(@stripe_event.type)
        StripeDataJobs::TryToSyncCustomerSubscriptionFromStripeSubscription.perform_async(@stripe_event.data.object.id, @event_payload['account'])
      elsif %w[charge.succeeded charge.refunded].include?(@stripe_event.type)
        StripeDataJobs::TryToSyncLifetimeValueFromStripeCharge.perform_async(@stripe_event.data.object.id, @event_payload['account'])
      end
    end
  end
end