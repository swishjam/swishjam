require_relative '../base'

module SourceDataCollections
  module Stripe
    class Charges < Base
      self.attributes = %i[id object amount amount_captured amount_refunded application_fee application_fee_amount]
  
      def initialize(stripe_charges)
        @stripe_charges = stripe_charges
      end
      
      def each(&block)
        @stripe_charges.each(&block)
      end
  
      def as_sql_json
        @stripe_charges.map do |stripe_charge|
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