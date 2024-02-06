module StripeHelpers
  module BackFillers
    class SupplementalFreeTrialStarted < Base
      def enqueue_for_ingestion!
        events = []
        data_fetcher.subscriptions_for_past_year.each do |subscription|
          next if subscription.trial_start.nil?
          parsed_event = StripeHelpers::SupplementalEvents::NewFreeTrial.new(subscription, public_key: public_key).as_parsed_event
          events << parsed_event.formatted_for_ingestion
        rescue => e
          Sentry.capture_message("Failed to enqueue supplemental new free trial event for subscription #{subscription.id} (#{e.message})")
        end
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.PREPARED_EVENTS, events) if events.any?
        events.count
      end
    end
  end
end