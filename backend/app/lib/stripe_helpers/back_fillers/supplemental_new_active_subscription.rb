module StripeHelpers
  module BackFillers
    class SupplementalNewActiveSubscription < Base
      def enqueue_for_ingestion!
        events = []
        data_fetcher.subscriptions_for_past_year(status: 'all').each do |subscription|
          next if subscription.status == 'incomplete' || subscription.status == 'incomplete_expired'
          canceled_while_trialing = subscription.status == 'canceled' && subscription.trial_end.present? && subscription.trial_end > subscription.canceled_at
          next if canceled_while_trialing
          events << StripeHelpers::SupplementalEvents::NewActiveSubscription.new(subscription, public_key: public_key).as_swishjam_event
        rescue => e
          Sentry.capture_message("Failed to enqueue supplemental new active subscription event for subscription #{subscription.id} (#{e.message})")
        end
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, events) if events.any?
        events.count
      end
    end
  end
end