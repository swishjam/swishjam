module StripeHelpers
  module EventAttributeParsers
    class SubscriptionCreated < Base
      self.attributes_to_capture = [:'amount', :'customer', :'items']
    end
  end
end