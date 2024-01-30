module Ingestion
  module EventPreparers
    class UserIdentifyHandler < Base
      class InvalidIdentifyEvent < StandardError; end;

      def handle_and_return_prepared_events!
        validate_provided_payload!
        device = workspace.analytics_user_profile_devices.find_by(swishjam_cookie_value: parsed_event.device_identifier)
        if device.present?
          reassign_existing_device_to_identified_user_if_necessary!(device)
        else
          device = create_or_update_user_profile_and_create_new_device!
        end
        parsed_event.set_user_profile(device.owner)
        parsed_event
      end

      private

      def validate_provided_payload!
        raise InvalidIdentifyEvent, "Tried to identify an event that wasn't named `identify`, provided name: #{parsed_event.name}" if parsed_event.name != 'identify'
        raise InvalidIdentifyEvent, "Provided event properties did not include a `userIdentifier` key, provided properties: #{parsed_event.properties}" if provided_unique_user_identifier.blank?
      end

      def provided_email
        parsed_event.properties['email']
      end

      def provided_user_properties
        properties_to_ignore = %w[userIdentifier email user_attributes device_fingerprint device_identifier url sdk_version session_identifier page_view_identifier organization_attributes]
        parsed_event.properties.except(*properties_to_ignore)
      end

      def reassign_existing_device_to_identified_user_if_necessary!(existing_device)
        current_owner_of_device = existing_device.analytics_user_profile
        is_new_device_owner = current_owner_of_device.user_unique_identifier != provided_unique_user_identifier
        if is_new_device_owner
          reassign_device_to_new_or_existing_user!(existing_device)
        else
          # the device is already owned by the identified user, let's just update the user profile with any new information
          current_owner_of_device.metadata = current_owner_of_device.metadata.merge(provided_user_properties)
          current_owner_of_device.email = provided_email
          current_owner_of_device.last_seen_at_in_web_app = Time.current
          current_owner_of_device.first_seen_at_in_web_app ||= Time.current
          current_owner_of_device.save! if current_owner_of_device.changed?
        end
      end

      # if the user identifier provided in the identify event is different than the user identifier for the device
      def reassign_device_to_new_or_existing_user!(existing_device)
        user_profile = existing_user_for_identify_properties
        if user_profile.present?
          user_profile.email = provided_email if !provided_email.blank?
          user_profile.metadata = user_profile.metadata.merge(provided_user_properties)
          user_profile.last_seen_at_in_web_app = Time.current
          user_profile.first_seen_at_in_web_app ||= Time.current
          user_profile.save! if user_profile.changed?
        else
          # if there is not already a user profile for the provided user identifier, we need to create one and assign it to the device
          user_profile = workspace.analytics_user_profiles.create!(
            user_unique_identifier: provided_unique_user_identifier,
            email: provided_email,
            metadata: provided_user_properties,
            last_seen_at_in_web_app: Time.current,
            first_seen_at_in_web_app: Time.current,
            created_by_data_source: data_source,
          )
        end
        if existing_device.owner.is_anonymous?
          Ingestion::ProfileMerger.new(previous_profile: existing_device.owner, new_profile: user_profile).merge!
        end
        existing_device.update!(analytics_user_profile_id: user_profile.id)
      end

      def create_or_update_user_profile_and_create_new_device!
        user_profile = existing_user_for_identify_properties
        if user_profile.nil?
          user_profile = workspace.analytics_user_profiles.create!(
            user_unique_identifier: provided_unique_user_identifier,
            email: provided_email,
            metadata: provided_user_properties,
            last_seen_at_in_web_app: Time.current,
            first_seen_at_in_web_app: Time.current,
            created_by_data_source: data_source,
          )
        else
          user_profile.email = provided_email if !provided_email.blank?
          user_profile.metadata = provided_user_properties
          user_profile.last_seen_at_in_web_app = Time.current
          user_profile.first_seen_at_in_web_app = user_profile.first_seen_at_in_web_app || Time.current
          # there's a chance `user_unique_identifier` is nil if the profile was created by a data source other than instrumentation (ie: Stripe)
          user_profile.user_unique_identifier = provided_unique_user_identifier 
          user_profile.save!
        end
        new_device = workspace.analytics_user_profile_devices.create!(
          analytics_user_profile_id: user_profile.id,
          device_fingerprint: parsed_event.device_fingerprint, 
          swishjam_cookie_value: parsed_event.device_identifier,
        )
      end

      def existing_user_for_identify_properties
        return @existing_user_for_identify_properties if @executed_existing_user_for_identify_properties_query
        @existing_user_for_identify_properties = workspace.analytics_user_profiles.find_by(user_unique_identifier: provided_unique_user_identifier)
        if @existing_user_for_identify_properties.nil? && !provided_email.blank?
          @existing_user_for_identify_properties = workspace.analytics_user_profiles.find_by(user_unique_identifier: nil, email: provided_email)
        end
        @executed_existing_user_for_identify_properties_query = true
        @existing_user_for_identify_properties
      end
    end
  end
end