require_relative 'base'

module Extractors
  module Stripe
    class Charges < Base
      def self.extract!(source)
        Extractors::Stripe::Charges.fetch_all('charges', source[:stripe_account_id])
      end
    end
  end
end