require_relative '../base'

module SourceDataCollections
  module Stripe
    class PaymentIntents < Base
      self.attributes = %i[id object amount amount_captured amount_refunded application_fee application_fee_amount]
  
      def initialize(stripe_payment_intents)
        @stripe_payment_intents = stripe_payment_intents
      end
  
      def as_sql
        @stripe_charges.map do |stripe_charge|
          self.class.attributes.map{ |attribute| stripe_charge[attribute] }
        end
      end
    end
  end
end