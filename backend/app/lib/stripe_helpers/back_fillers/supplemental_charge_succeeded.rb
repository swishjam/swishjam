module StripeHelpers
  module BackFillers
    class SupplementalChargeSucceeded < Base
      def enqueue_for_ingestion!
        events = []
        data_fetcher.charges_for_past_year.each do |charge|
          next if charge.status != 'succeeded'
          parsed_event = StripeHelpers::SupplementalEvents::ChargeSucceeded.new(charge, public_key: public_key).as_parsed_event
          events << parsed_event.formatted_for_ingestion
        end
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, events) if events.any?
        events.count
      end
    end
  end
end