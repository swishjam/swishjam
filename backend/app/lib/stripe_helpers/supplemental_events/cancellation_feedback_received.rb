module StripeHelpers
  module SupplementalEvents
    class CancellationFeedbackReceived < Base
      # record = Stripe::Subscription
      FEEDBACK_CODES = {
        'customer_service' => 'Customer service was less than expected',
        'low_quality' => 'Quality was less than expected',
        'missing_features' => 'Some features are missing',
        'other' => 'Other reason',
        'switched_service' => "I'm switching to a different service",
        'too_complex' => 'Ease of use was less than expected',
        'unused' => "I don't use the service enough",
      }

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
          cancellation_feedback: FEEDBACK_CODES[stripe_record.cancellation_details&.feedback],
          cancellation_feedback_code: stripe_record.cancellation_details&.feedback,
          cancellation_reason: stripe_record.cancellation_details&.reason,
        }
      end
    end
  end
end