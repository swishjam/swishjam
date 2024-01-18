module StripeHelpers
  module BackFillers
    class SupplementalNewSubscriber < Base
      def enqueue_for_ingestion!
        events = []
        data_fetcher.customers_for_past_year.each do |customer|
          events << StripeHelpers::SupplementalEvents::NewSubscriber.new(customer, public_key: public_key).as_swishjam_event
        rescue => e
          Sentry.capture_message("Failed to enqueue supplemental new subscriber event for customer #{customer.id} (#{e.message})")
        end
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, events) if events.any?
        events.count
      end
    end
  end
end