module StripeHelpers
  module EventAttributeParsers
    class ChargeFailed < Base
      self.attributes_to_capture = [:'id', :'amount', :'customer', :'payment_method_details.type']
      self.methods_to_capture = [:display_amount]

      def display_amount
        "$#{sprintf('%.2f', (amount / 100.0))}"
      end
    end
  end
end