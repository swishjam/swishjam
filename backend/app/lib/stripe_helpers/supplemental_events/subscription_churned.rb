module StripeHelpers
  module SupplementalEvents
    class SubscriptionChurned < Base
      # record = Stripe::Subscription

      def occurred_at
        Time.at(stripe_record.canceled_at)
      end

      def properties
        mrr = nil
        display_mrr = nil
        begin
          mrr = StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(stripe_record, include_canceled: true)
          display_mrr = "$#{sprintf('%.2f', (mrr / 100.0))}" if mrr.is_a?(Numeric)
        rescue => e
          Sentry.capture_message("Failed to calculate MRR for subscription #{stripe_record.id} (#{e.message})")
        end
        {
          stripe_subscription_id: stripe_record.id,
          mrr: mrr,
          display_mrr: display_mrr,
          cancellation_comment: stripe_record.cancellation_details&.comment,
          cancellation_feedback: stripe_record.cancellation_details&.feedback,
          cancellation_reason: stripe_record.cancellation_details&.reason,
        }
      end
    end
  end
end