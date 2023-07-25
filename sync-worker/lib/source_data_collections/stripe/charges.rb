require_relative '../base'

module SourceDataCollections
  module Stripe
    class Charges < Base
      self.attributes = %i[id object amount amount_captured amount_refunded application_fee application_fee_amount]
  
      def initialize(stripe_charges)
        @stripe_charges = stripe_charges
      end
  
      def as_sql
        @stripe_charges.map do |stripe_charge|
          self.class.attributes.map{ |attribute| stripe_charge[attribute.to_s] }
        end
      end
      alias to_sql as_sql
      
    end
  end
end