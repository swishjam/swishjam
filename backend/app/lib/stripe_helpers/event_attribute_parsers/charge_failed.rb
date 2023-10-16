module StripeHelpers
  module EventAttributeParsers
    class ChargeFailed < Base
      self.attributes_to_capture = [:'amount', :'customer', :'payment_method_details.type']
    end
  end
end