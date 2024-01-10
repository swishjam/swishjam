module StripeHelpers
  module EventAttributeParsers
    class ChargeSucceeded < Base
      self.attributes_to_capture = %i[id amount customer payment_method_details.type]
      self.methods_to_capture = %i[display_amount]

      def display_amount
        "$#{sprintf('%.2f', (stripe_object.amount / 100.0))}"
      end
    end
  end
end