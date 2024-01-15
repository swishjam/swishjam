module StripeHelpers
  module SupplementalEvents
    class NewActiveSubscription < Base
      # record = Stripe::Subscription

      def occurred_at
        stripe_record.trial_end || stripe_record.start_date
      end

      def properties
        {
          stripe_subscription_id: stripe_record.id,
          mrr: StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(stripe_record, include_canceled: true, include_trialing: true),
        }
      end
    end
  end
end