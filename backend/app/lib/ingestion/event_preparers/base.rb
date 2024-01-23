module Ingestion
  module EventPreparers
    class Base
      attr_accessor :parsed_event

      def initialize(parsed_event)
        @parsed_event = parsed_event
      end

      def handle_and_return_new_event_json!
        raise NotImplementedError, "You must implement the handle_and_return_new_event_json! method in #{self.class.name}"
      end

      def workspace
        @workspace ||= Workspace.for_public_key!(parsed_event.swishjam_api_key)
      end

      def provided_unique_user_identifier
        parsed_event.properties['userIdentifier'] || 
          parsed_event.properties['user_id'] || 
          parsed_event.properties['userId'] || 
          parsed_event.properties.dig('user', 'id')
      end
    end
  end
end