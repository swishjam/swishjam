module StripeHelpers
  module SupplementalEvents
    class ChargeSucceeded < Base
      # record = Stripe::Charge

      def properties
        {
          amount_in_cents: stripe_record.amount,
        }
      end
    end
  end
end