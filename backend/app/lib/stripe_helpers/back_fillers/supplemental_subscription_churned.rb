module StripeHelpers
  module BackFillers
    class SupplementalSubscriptionChurned < Base
      def enqueue_for_ingestion!
        events = []
        data_fetcher.subscriptions_for_past_year(status: 'canceled').each do |subscription|
          mrr = StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(subscription, include_canceled: true)
          next unless mrr > 0
          parsed_event = StripeHelpers::SupplementalEvents::SubscriptionChurned.new(subscription, public_key: public_key).as_parsed_event
          events << parsed_event.formatted_for_ingestion
        end
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, events) if events.any?
        events.count
      end
    end
  end
end