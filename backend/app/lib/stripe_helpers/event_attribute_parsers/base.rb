module StripeHelpers
  module EventAttributeParsers
    class Base
      class << self
        attr_accessor :attributes_to_capture, :methods_to_capture
      end

      def initialize(stripe_event)
        @stripe_event = stripe_event
      end

      def stripe_object
        @stripe_event.data.object
      end

      def default_json_properties
        json = {
          event_id: @stripe_event.id,
          event_type: @stripe_event.type,
          object_type: stripe_object.object,
          object_id: stripe_object.id,
        }
        if stripe_object.respond_to?(:amount)
          json[:amount] = stripe_object.amount
          json[:display_amount] = "$#{sprintf('%.2f', (stripe_object.amount / 100.0))}"
        end
        apply_customer_details_to_properties(json)
        json
      end

      def event_properties
        default_json_properties.tap do |h|
          (self.class.attributes_to_capture || []).each do |attribute|
            attribute_chain = attribute.to_s.split('.')
            attribute_value = attribute_chain.inject(stripe_object) do |object, method|
              begin
                object.send(method)
              rescue => e
                Sentry.capture_message("The #{method.to_s} attribute in #{self.class.to_s} threw an error, ignoring from event attributes: #{e.inspect}")
              end
            end
            h[attribute.to_s] = attribute_value
          end
          (self.class.methods_to_capture || []).each do |method|
            begin
              h[method.to_s] = send(method)
            rescue => e
              Sentry.capture_message("The #{method.to_s} method in #{self.class.to_s} threw an error, ignoring from event attributes: #{e.inspect}")
            end
          end
        end
      end

      def apply_customer_details_to_properties(properties_json)
        if stripe_object.respond_to?(:customer) && stripe_object.customer.present? && @stripe_event.respond_to?(:account) && @stripe_event.account.present?
          stripe_customer = stripe_object.customer
          if stripe_customer.is_a?(String)
            stripe_customer = ::Stripe::Customer.retrieve(stripe_customer, stripe_account: @stripe_event.account)
          end
          properties_json[:customer_id] = stripe_customer.id
          properties_json[:customer_email] = stripe_customer.email if stripe_customer.respond_to?(:email) && !stripe_customer.email.blank?
          properties_json[:customer_name] = stripe_customer.name if stripe_customer.respond_to?(:name) && !stripe_customer.name.blank?
        end
        properties_json
      rescue => e
        Sentry.capture_exception(e)
        properties_json
      end

    end
  end
end