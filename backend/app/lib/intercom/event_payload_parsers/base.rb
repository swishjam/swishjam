module Intercom
  module EventPayloadParsers
    class Base
      def initialize(event_payload, swishjam_api_key)
        @event_payload = event_payload
        @swishjam_api_key = swishjam_api_key
      end

      def to_json
        {
          uuid: @event_payload['id'],
          swishjam_api_key: @swishjam_api_key,
          name: "intercom.#{@event_payload['topic']}",
          occurred_at: Time.at(@event_payload['created_at']).to_datetime,
          properties: properties,
        }
      end

      private

      def properties
        raise NotImplementedError, "#{self.class.name} must implement `properties` method."
      end

      def try_to_associate_user_profile_with_event(attrs, email)
        return attrs if email.blank?
        user_profile = integration.workspace.analytics_user_profiles.find_by_case_insensitive_email(email)
        if user_profile.nil?
          Sentry.capture_message("Could not find a matching user profile for intercom user with email #{email} in workspace #{integration.workspace.name} (#{integration.workspace.id}), so we created one.")
          user_profile = integration.workspace.analytics_user_profiles.create!(
            email: email,
            first_name: (@event_payload.dig('data', 'item', 'source', 'author', 'name') || "").split(' ').first,
            last_name: (@event_payload.dig('data', 'item', 'source', 'author', 'name') || "").split(' ').last,
          )
        end
        attrs[Analytics::Event::ReservedPropertyNames.USER_PROFILE_ID] = user_profile.id
        attrs
      end
    end
  end