module StripeHelpers
  module BackFillers
    class SupplementalChargeSucceeded < Base
      def enqueue_for_ingestion!
        events = []
        data_fetcher.charges_for_past_year.each do |charge|
          next if charge.status != 'succeeded'
          events << StripeHelpers::SupplementalEvents::ChargeSucceeded.new(charge, public_key: public_key).as_swishjam_event
        rescue => e
          Sentry.capture_message("Failed to enqueue supplemental charge succeeded event for charge #{charge.id} (#{e.message})")
        end
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, events) if events.any?
        events.count
      end
    end
  end
end