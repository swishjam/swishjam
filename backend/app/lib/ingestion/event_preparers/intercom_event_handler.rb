module Ingestion
  module EventPreparers
    class IntercomEventHandler < Base
      PROPERTY_PARSER_DICT = {
        'intercom.conversation.user.created' => Intercom::EventPayloadParsers::ConversationUserCreated,
        'intercom.conversation.admin.replied' => Intercom::EventPayloadParsers::ConversationAdminReplied,
        'intercom.conversation.admin.closed' => Intercom::EventPayloadParsers::ConversationAdminReplied,
      }

      def handle_and_return_prepared_events!
        parsed_event.set_user_profile(user_profile_for_event) if user_profile_for_event.present?        
        parsed_event.override_properties!(event_properties)
        parsed_event
      end

      private

      def event_properties
        @event_properties ||= (PROPERTY_PARSER_DICT[parsed_event.name] || Intercom::EventPayloadParsers::Default).new(parsed_event.payload).properties
      end

      def user_profile_for_event
        @user_profile ||= begin
          email = parsed_event.payload.dig('data', 'item', 'source', 'author', 'email')
          return if email.blank?
          user_profile = @workspace.analytics_user_profiles.find_by(email: email)
          if user_profile.nil?
            user_profile = @workspace.analytics_user_profiles.new(email: email)
          end
          user_profile.metadata['intercom_name'] = parsed_event.payload.dig('data', 'item', 'source', 'author', 'name')
          user_profile.metadata['intercom_id'] = parsed_event.payload.dig('data', 'item', 'source', 'author', 'id')
          user_profile.save! if user_profile.changed?
          user_profile
        end
      end
    end
  end
end