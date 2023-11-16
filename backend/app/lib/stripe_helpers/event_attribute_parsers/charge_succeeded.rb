module StripeHelpers
  module EventAttributeParsers
    class ChargeSucceeded < Base
      self.attributes_to_capture = [:'id', :'amount', :'customer', :'payment_method_details.type']
    end
  end
end