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
        json
      end

      def event_properties
        # Hash.new.tap do |h| 
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

    end
  end
end