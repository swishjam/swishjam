module StripeHelpers
  module BackFillers
    class SupplementalNewSubscriber < Base
      def enqueue_for_ingestion!
        events = data_fetcher.customers_for_past_year.map do |customer|
          StripeHelpers::SupplementalEvents::NewSubscriber.new(customer, public_key: public_key).as_swishjam_event
        end
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, events) if events.any?
        events.count
      end
    end
  end
end