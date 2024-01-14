module StripeHelpers
  module SupplementalEvents
    class NewFreeTrial < Base
      # record = Stripe::Subscription

      def occurred_at
        stripe_record.trial_start
      end

      def properties
        {
          stripe_subscription_id: stripe_record.id,
          potential_mrr: StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(stripe_record, include_trialing: true, include_canceled: true),
          free_trial_length_in_days: (stripe_record.trial_end.to_f - stripe_record.trial_start) / 1.day
        }
      end
    end
  end
end