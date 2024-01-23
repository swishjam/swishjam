module StripeHelpers
  module BackFillers
    class SupplementalFreeTrialStarted < Base
      def enqueue_for_ingestion!
        events = []
        data_fetcher.subscriptions_for_past_year.each do |subscription|
          next if subscription.trial_start.nil?
          parsed_event = StripeHelpers::SupplementalEvents::NewFreeTrial.new(subscription, public_key: public_key).as_parsed_event
          events << parsed_event.formatted_for_ingestion
        end
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, events) if events.any?
        events.count
      end
    end
  end
end