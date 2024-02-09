module StripeHelpers
  module BackFillers
    class Events < Base
      # I think we only want to backfill the supplemental events, not the Stripe events themselves
      # the other backfillers handle all of the data we need for revenue analytics

      # def enqueue_historical_events_to_be_ingested!
      #   # so we don't ingest any webhooks during the backfill
      #   integration.disable!
      #   events_to_ingest = []
      #   events_for_all_of_time.each do |event|
      #     stripe_customer = nil
      #     if event.data.object.respond_to?(:customer) && event.data.object.customer.is_a?(String) && !ENV['STRIPE_SKIP_CUSTOMER_LOOKUP_IN_WEBHOOKS']
      #       stripe_customer = data_fetcher.get_customer(event.data.object.customer)
      #     end
          
      #     event_parser = StripeHelpers::WebhookEventParser.new(event, workspace, stripe_customer)
      #     swishjam_event_data =  event_parser.formatted_event_data
      #     events_to_ingest << Analytics::Event.formatted_for_ingestion(
      #       uuid: swishjam_event_data['uuid'],
      #       swishjam_api_key: public_key,
      #       name: swishjam_event_data['event'],
      #       occurred_at: Time.at(swishjam_event_data['timestamp']),
      #       properties: swishjam_event_data.except('uuid', 'event', 'timestamp'),
      #     )
      #     supplemental_events = StripeHelpers::SupplementalEvents::Evaluator.new(
      #       stripe_event: event,
      #       stripe_customer: stripe_customer,
      #       public_key: public_key,
      #       maybe_user_profile_id: event_parser.maybe_user_profile&.id,
      #     ).parsed_events_for_any_matching_supplemental_events
      #     events_to_ingest.concat(supplemental_events)
      #   rescue => e
      #     Sentry.capture_exception(e)
      #   end
      #   Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, events_to_ingest) if events_to_ingest.any?
      #   integration.enable!
      # end

      # private

      # def events_for_all_of_time
      #   @events_for_all_of_time ||= StripeHelpers::DataFetchers.get_all { Stripe::Event.list({ limit: 100 }, stripe_account: stripe_account_id) }
      # end
    end
  end
end