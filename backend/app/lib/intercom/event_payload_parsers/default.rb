module Intercom
  module EventPayloadParsers
    class Default < Base
      def properties
        {
          item_id: @event_payload.dig('data', 'item', 'id'),
          item_type: @event_payload.dig('data', 'item', 'type'),
        }
      end
    end
  end
end