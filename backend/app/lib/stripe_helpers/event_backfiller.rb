module StripeHelpers
  class EventBackfiller
    def initialize(workspace)
      @workspace = workspace
      integration = Integrations::Stripe.for_workspace(workspace)
      raise "No Stripe integration found for workspace #{workspace.id}, cannot run backfill." if integration.nil?
      @public_key = workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.STRIPE)&.public_key
      raise "No Stripe API key found for workspace #{workspace.id}, cannot run backfill." if @public_key.nil?
      @stripe_account_id = integration.account_id
      @customer_cache = {}
    end

    def enqueue_historical_events_to_be_ingested!
      # so we don't ingest any webhooks during the backfill
      integration = Integrations::Stripe.for_workspace(@workspace)
      integration.disable!
      ingestion_data = events_for_all_of_time.map do |event|
        stripe_customer = nil
        if event.data.object.respond_to?(:customer) && event.data.object.customer.is_a?(String) && !ENV['STRIPE_SKIP_CUSTOMER_LOOKUP_IN_WEBHOOKS']
          stripe_customer = get_customer(event.data.object.customer)
        end
        swishjam_event_data = StripeHelpers::WebhookEventParser.new(event, @workspace, stripe_customer).formatted_event_data
        Analytics::Event.formatted_for_ingestion(
          uuid: swishjam_event_data['uuid'],
          swishjam_api_key: @public_key,
          name: swishjam_event_data['event'],
          occurred_at: Time.at(swishjam_event_data['timestamp']),
          properties: swishjam_event_data.except('uuid', 'event', 'timestamp'),
        )
      rescue => e
        Sentry.capture_exception(e)
      end
      Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, ingestion_data) if ingestion_data.any?
      integration.enable!
    end

    private

    def events_for_all_of_time
      @events_for_all_of_time ||= StripeHelpers::DataFetchers.get_all { Stripe::Event.list({ limit: 100 }, stripe_account: @stripe_account_id) }
    end

    def get_customer(customer_id)
      @customer_cache[customer_id] ||= ::Stripe::Customer.retrieve(customer_id, { stripe_account: @stripe_account_id })
    end
  end
end