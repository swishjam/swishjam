module StripeHelpers
  module EventAttributeParsers
    class SubscriptionCreated < Base
      self.attributes_to_capture = [:'id', :'customer']
    end
  end
end