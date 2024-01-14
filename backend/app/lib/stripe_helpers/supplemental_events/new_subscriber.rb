module StripeHelpers
  module SupplementalEvents
    class NewSubscriber < Base
      # record = Stripe::Customer
      def properties
        {}
      end
    end
  end
end