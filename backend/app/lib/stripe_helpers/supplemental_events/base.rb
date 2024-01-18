module StripeHelpers
  module SupplementalEvents
    class Base
      attr_accessor :stripe_record, :user_profile_id, :public_key

      def initialize(stripe_record, public_key:, stripe_customer: nil, user_profile_id: nil)
        @stripe_record = stripe_record
        @public_key = public_key
        @stripe_customer = stripe_customer
        @user_profile_id = user_profile_id
      end
      
      def self.EVENT_NAME
        "stripe.supplemental.#{self.to_s.split('::').last.underscore}"
      end

      def occurred_at
        stripe_record.created
      end

      def stripe_customer
        if stripe_record.is_a?(Stripe::Customer)
          stripe_record
        elsif stripe_record.respond_to?(:customer) && stripe_record.customer.is_a?(Stripe::Customer)
          stripe_record.customer
        else
          @stripe_customer
        end
      end

      def properties
        raise NotImplementedError, "`properties` must be implemented in subclass #{self.class.to_s}"
      end

      def uuid
        "#{stripe_record.id}-#{self.class.to_s.split('::').last.underscore}"
      end

      def as_swishjam_event
        props = properties
        props[:stripe_customer_id] = stripe_customer.id if stripe_customer
        props[:stripe_customer_email] = stripe_customer.email if stripe_customer && stripe_customer.respond_to?(:email)
        props[:stripe_object_id] = stripe_record.id
        props[:user_profile_id] = user_profile_id if user_profile_id
        Analytics::Event.formatted_for_ingestion(
          ingested_at: Time.current,
          uuid: uuid,
          swishjam_api_key: public_key,
          name: self.class.EVENT_NAME,
          occurred_at: occurred_at.is_a?(Integer) ? Time.at(occurred_at) : occurred_at,
          properties: props,
        )
      end
    end
  end
end