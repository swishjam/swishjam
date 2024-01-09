module StripeHelpers
  module EventAttributeParsers
    class Base
      class << self
        attr_accessor :attributes_to_capture, :methods_to_capture
      end

      def initialize(stripe_event)
        @stripe_event = stripe_event
      end

      def to_json
        Hash.new.tap do |h| 
          (self.class.attributes_to_capture || []).each do |attribute|
            attribute_chain = attribute.to_s.split('.')
            attribute_value = attribute_chain.inject(@stripe_event.data.object) do |object, method|
              begin
                object.send(method)
              rescue => e
                Sentry.capture_exception("The #{method.to_s} attribute in #{self.class.to_s} threw an error, ignoring from event attributes: #{e.inspect}")
              end
            end
            h[attribute.to_s] = attribute_value
          end
          (self.class.methods_to_capture || []).each do |method|
            begin
              h[method.to_s] = send(method)
            rescue => e
              Sentry.capture_exception("The #{method.to_s} method in #{self.class.to_s} threw an error, ignoring from event attributes: #{e.inspect}")
            end
          end
        end
      end

    end
  end
end