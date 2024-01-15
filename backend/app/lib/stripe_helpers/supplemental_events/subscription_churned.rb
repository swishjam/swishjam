module StripeHelpers
  module SupplementalEvents
    class SubscriptionChurned < Base
      # record = Stripe::Subscription

      def occurred_at
        Time.at(stripe_record.canceled_at)
      end

      def properties
        {
          stripe_subscription_id: stripe_record.id,
          mrr: StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(stripe_record, include_canceled: true),
          cancellation_comment: stripe_record.cancellation_details&.comment,
          cancellation_feedback: stripe_record.cancellation_details&.feedback,
          cancellation_reason: stripe_record.cancellation_details&.reason,
        }
      end
    end
  end
end