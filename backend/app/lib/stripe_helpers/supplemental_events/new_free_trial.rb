module StripeHelpers
  module SupplementalEvents
    class NewFreeTrial < Base
      # record = Stripe::Subscription

      def occurred_at
        stripe_record.trial_start
      end

      def properties
        mrr = nil
        display_mrr = nil
        begin
          mrr = StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(stripe_record, include_trialing: true, include_canceled: true)
          display_mrr = "$#{sprintf('%.2f', (mrr / 100.0))}" if mrr.is_a?(Numeric)
        rescue => e
          Sentry.capture_message("Failed to calculate MRR for subscription #{stripe_record.id} (#{e.message})")
        end
        {
          stripe_subscription_id: stripe_record.id,
          potential_mrr: mrr,
          potential_display_mrr: display_mrr,
          free_trial_length_in_days: (stripe_record.trial_end.to_f - stripe_record.trial_start) / 1.day
        }
      end
    end
  end
end
