module StripeHelpers
  module EventAttributeParsers
    class SubscriptionCreated < Base
      self.methods_to_capture = [:'amount', :'mrr', :'products']

      def amount
        StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(@stripe_event.data.object)
      end

      def mrr
        amount
      end

      def products
        @stripe_event.data.object.items.data.map{ |item| item.price.product }.join(', ')
      end
    end
  end
end