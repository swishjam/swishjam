require_relative '../base'

module SourceDataCollections
  module Stripe
    class PaymentIntents < Base
      self.attributes = %i[id object amount amount_captured amount_refunded application_fee application_fee_amount]
  
      def initialize(stripe_payment_intents)
        @stripe_payment_intents = stripe_payment_intents
      end

      def each(&block)
        @stripe_payment_intents.each(&block)
      end
  
      def as_sql_json
        @stripe_payment_intents.map do |stripe_charge|
          Hash.new.tap do |hash|
            self.class.attributes.each do |attribute|
              hash[attribute] = stripe_charge[attribute.to_s]
            end
          end
        end
      end
      alias to_sql_json as_sql_json

    end
  end
end