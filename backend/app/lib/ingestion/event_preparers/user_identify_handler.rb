module Ingestion
  module EventPreparers
    class UserIdentifyHandler < Base
      class InvalidIdentifyEvent < StandardError; end;

      def handle_and_return_prepared_events!
        validate_provided_payload!
        user_profile = create_or_update_user_profile!
        if parsed_event.device_identifier.blank?
          parsed_event.set_user_profile(user_profile)
          return parsed_event
        end
        device = workspace.analytics_user_profile_devices.find_by(swishjam_cookie_value: parsed_event.device_identifier)
        if device.present?
          is_new_device_owner = device.owner.user_unique_identifier != provided_unique_user_identifier
          if is_new_device_owner
            Ingestion::ProfileMerger.new(previous_profile: device.owner, new_profile: user_profile).merge! if device.owner.is_anonymous?
            device.update!(analytics_user_profile_id: user_profile.id)
          end
        else
          device = workspace.analytics_user_profile_devices.create!(
            analytics_user_profile_id: user_profile.id,
            device_fingerprint: parsed_event.device_fingerprint, 
            swishjam_cookie_value: parsed_event.device_identifier,
          )
        end
        parsed_event.set_user_profile(device.owner)
        parsed_event
      end

      private

      def validate_provided_payload!
        raise InvalidIdentifyEvent, "Tried to identify an event that wasn't named `identify`, provided name: #{parsed_event.name}" if parsed_event.name != 'identify'
        raise InvalidIdentifyEvent, "Provided event properties did not include a `userIdentifier` key, provided properties: #{parsed_event.properties}" if provided_unique_user_identifier.blank?
      end

      def create_or_update_user_profile!
        @user_profile ||= begin
          byebug
          user_profile = workspace.analytics_user_profiles.find_by(user_unique_identifier: provided_unique_user_identifier)
          if user_profile.nil? && !provided_email.blank?
            user_profile = workspace.analytics_user_profiles.find_by(user_unique_identifier: nil, email: provided_email)
          end
          if user_profile.nil?
            supplemented_user_properties = sanitized_user_properties
            supplemented_user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL] = parsed_event.properties['session_landing_page_url'] || parsed_event.properties['url'] if parsed_event.properties['session_landing_page_url'].present? || parsed_event.properties['url'].present?
            supplemented_user_properties[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL] = parsed_event.properties['session_referrer'] || parsed_event.properties['referrer'] if parsed_event.properties['session_referrer'].present? || parsed_event.properties['referrer'].present?

            user_profile = workspace.analytics_user_profiles.new(
              user_unique_identifier: provided_unique_user_identifier,
              email: provided_email,
              metadata: supplemented_user_properties,
              last_seen_at_in_web_app: Time.current,
              first_seen_at_in_web_app: Time.current,
              created_by_data_source: data_source,
            )
          else
            user_profile.email = provided_email if !provided_email.blank?
            user_profile.metadata ||= {}
            user_profile.metadata = user_profile.metadata.merge(sanitized_user_properties)
            user_profile.last_seen_at_in_web_app = Time.current
            user_profile.first_seen_at_in_web_app ||= Time.current
            # there's a chance `user_unique_identifier` is nil if the profile was created by a data source other than instrumentation (ie: Stripe)
            user_profile.user_unique_identifier = provided_unique_user_identifier 
          end
          user_profile.save! if user_profile.changed?
          user_profile
        end
      end

      def provided_email
        parsed_event.properties['email']
      end

      def sanitized_user_properties
        parsed_event.properties.except('email', 'userIdentifier', *Analytics::Event::ReservedPropertyNames.all.map(&:to_s))
      end
    end
  end
end