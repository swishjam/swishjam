module StripeHelpers
  module EventAttributeParsers
    class SubscriptionCreated < Base
      self.attributes_to_capture = %i[status]
      self.methods_to_capture = %i[amount display_amount mrr products]

      def amount
        StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(@stripe_event.data.object, include_any_status: true)
      end
      
      def display_amount
        "$#{sprintf('%.2f', (amount / 100.0))}"
      end

      def mrr
        amount
      end

      def products
        stripe_object.items.data.map{ |item| item.price.product }.join(', ')
      end
    end
  end
end