require_relative 'base'

module Extractors
  module Stripe
    class PaymentIntents < Base
      def self.extract!(source)
        Extractors::Stripe::PaymentIntents.fetch_all('payment_intents', source[:stripe_account_id])
      end
    end
  end
end