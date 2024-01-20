module Ingestion
  module EventHandlers
    class BasicEventHandler < Base
      def handle_and_return_new_event_json!
        parsed_event.set_user_profile(user_profile_for_event)
        parsed_event
      end

      private

      def user_profile_for_event
        @user_profile_for_event ||= begin
          if provided_unique_user_identifier.present?
            existing_user = workspace.analytics_user_profiles.find_by(user_unique_identifier: provided_unique_user_identifier)
            if existing_user.present?
              existing_user
            else
              workspace.analytics_user_profiles.create!(
                user_unique_identifier: provided_unique_user_identifier,
                email: parsed_event.properties['user']&.email,
                metadata: metadata_for_new_user_profile,
              )
            end
          elsif parsed_event.device_identifier.present?
            existing_device = workspace.analytics_user_profile_devices.find_by(swishjam_cookie_value: parsed_event.device_identifier)
            if existing_device.present?
              existing_device.owner
            else
              anonymous_user = workspace.analytics_user_profiles.create!(metadata: metadata_for_new_user_profile)
              workspace.analytics_user_profile_devices.create!(
                swishjam_cookie_value: parsed_event.device_identifier, 
                device_fingerprint: parsed_event.device_fingerprint,
                analytics_user_profile_id: anonymous_user.id
              )
              anonymous_user
            end
          end
        end
      end

      def metadata_for_new_user_profile
        user_metadata = {}
        user_metadata[:initial_referrer_url] = parsed_event.properties['referrer'] if parsed_event.properties['referrer'].present?
        user_metadata[:initial_landing_page_url] = parsed_event.properties['url'] if parsed_event.properties['url'].present?
        user_metadata.merge!(parsed_event.properties['user']&.except('id', 'email') || {})
        user_metadata
      end
    end
  end
end