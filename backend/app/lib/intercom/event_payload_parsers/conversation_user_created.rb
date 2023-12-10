module Intercom
  module EventPayloadParsers
    class ConversationUserCreated < Base
      def properties
        attrs = {
          item_id: @event_payload.dig('data', 'item', 'id'),
          item_type: @event_payload.dig('data', 'item', 'type'),
          subject: @event_payload.dig('data', 'item', 'source', 'subject'),
          message: @event_payload.dig('data', 'item', 'source', 'body'),
          user_type: @event_payload.dig('data', 'item', 'source', 'author', 'type'),
          intercom_user_id: @event_payload.dig('data', 'item', 'source', 'author', 'id'),
          url: @event_payload.dig('data', 'item', 'source', 'url'),
          delivered_as: @event_payload.dig('data', 'item', 'source', 'delivered_as'),
          email: @event_payload.dig('data', 'item', 'source', 'author', 'email'),
        }
        try_to_associate_user_profile_with_event(attrs, @event_payload.dig('data', 'item', 'source', 'author', 'email'))
      end
    end
  end
end