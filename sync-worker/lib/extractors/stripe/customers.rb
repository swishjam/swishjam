require_relative 'base'
require_relative '../../../swishjam_models/organization'

module Extractors
  module Stripe
    class Customers < Base
      self.swishjam_model = SwishjamModels::Organization

      def self.extract!(source)
        Extractors::Stripe::Charges.fetch_all('customers', source[:stripe_account_id])
      end
    end
  end
end