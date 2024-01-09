module StripeHelpers
  module EventAttributeParsers
    class SubscriptionCreated < Base
      self.methods_to_capture = [:'amount_in_cents', :display_amount, :'products']

      def amount_in_cents
        @stripe_event.data.object.items.data.sum do |item|
          item.quantity * item.price.unit_amount
        end
      end

      def display_amount
        "$#{sprintf('%.2f', (amount_in_cents / 100.0))}"
      end

      def products
        @stripe_event.data.object.items.data.map{ |item| item.price.product }.join(', ')
      end
    end
  end
end