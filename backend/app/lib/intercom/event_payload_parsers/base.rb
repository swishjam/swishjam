module Intercom
  module EventPayloadParsers
    class Base
      attr_reader :event_payload
      
      def initialize(event_payload)
        @event_payload = event_payload
      end

      def properties
        raise NotImplementedError, "Subclass #{self.class} must implement #properties method."
      end
    end
  end
end