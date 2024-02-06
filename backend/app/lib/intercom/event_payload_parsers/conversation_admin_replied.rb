module Intercom
  module EventPayloadParsers
    class ConversationAdminReplied < Base
      def properties
        {
          item_id: event_payload.dig('data', 'item', 'id'),
          item_type: event_payload.dig('data', 'item', 'type'),
          subject: event_payload.dig('data', 'item', 'source', 'subject'),
          message: ((event_payload.dig('data', 'item', 'conversation_parts', 'conversation_parts') || [])[0] || {}).dig('body'),
          user_type: event_payload.dig('data', 'item', 'source', 'author', 'type'),
          intercom_user_id: event_payload.dig('data', 'item', 'source', 'author', 'id'),
          url: event_payload.dig('data', 'item', 'source', 'url'),
          delivered_as: event_payload.dig('data', 'item', 'source', 'delivered_as'),
          email: event_payload.dig('data', 'item', 'source', 'author', 'email'),
          admin_name: ((event_payload.dig('data', 'item', 'conversation_parts', 'conversation_parts') || [])[0] || {}).dig('author', 'name'),
          admin_email: ((event_payload.dig('data', 'item', 'conversation_parts', 'conversation_parts') || [])[0] || {}).dig('author', 'email'),
        }
      end
    end
  end
end