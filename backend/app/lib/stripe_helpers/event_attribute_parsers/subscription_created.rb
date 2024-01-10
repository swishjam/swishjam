module StripeHelpers
  module EventAttributeParsers
    class SubscriptionCreated < Base
      self.methods_to_capture = %i[amount_in_cents display_amount products]

      def amount_in_cents
        stripe_object.items.data.sum do |item|
          item.quantity * item.price.unit_amount
        end
      end

      def display_amount
        "$#{sprintf('%.2f', (amount_in_cents / 100.0))}"
      end

      def products
        stripe_object.items.data.map{ |item| item.price.product }.join(', ')
      end
    end
  end
end