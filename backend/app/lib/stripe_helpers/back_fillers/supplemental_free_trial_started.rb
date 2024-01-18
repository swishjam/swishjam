module StripeHelpers
  module BackFillers
    class SupplementalFreeTrialStarted < Base
      def enqueue_for_ingestion!
        events = []
        data_fetcher.subscriptions_for_past_year.each do |subscription|
          next if subscription.trial_start.nil?
          events << StripeHelpers::SupplementalEvents::NewFreeTrial.new(subscription, public_key: public_key).as_swishjam_event
        rescue => e
          Sentry.capture_message("Failed to enqueue supplemental new free trial event for subscription #{subscription.id} (#{e.message})")
        end
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, events) if events.any?
        events.count
      end
    end
  end
end