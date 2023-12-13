module StripeHelpers
  module EventAttributeParsers
    class SubscriptionCreated < Base
      self.methods_to_capture = [:'amount', :'products']

      def amount
        @stripe_event.data.object.items.data.sum do |item|
          item.quantity * item.price.unit_amount
        end
      end

      def products
        @stripe_event.data.object.items.data.map{ |item| item.price.product }.join(', ')
      end
    end
  end
end