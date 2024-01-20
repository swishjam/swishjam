module Ingestion
  module EventHandlers
    class UserIdentifyHandler < Base
      class InvalidIdentifyEvent < StandardError; end;
      def handle_identify_and_update_event!
        validate_provided_payload!
        device = workspace.analytics_user_profile_devices.find_by(swishjam_cookie_value: parsed_event.device_identifier)
        if device.present?
          handle_existing_device!(device)
        else
          device = handle_first_time_seeing_device!
        end
        parsed_event.set_user_profile(device.analytics_user_profile)
        parsed_event
      end

      private

      def validate_provided_payload!
        raise InvalidIdentifyEvent, "Tried to identify an event that wasn't named `identify`, provided name: #{parsed_event.name}" if parsed_event.name != 'identify'
        raise InvalidIdentifyEvent, "Provided event properties did not include a `userIdentifier` key, provided properties: #{parsed_event.properties}" if provided_unique_user_identifier.blank?
      end

      # def provided_unique_user_identifier
      #   parsed_event.properties['userIdentifier'] || parsed_event.properties['user_id']
      # end

      def provided_email
        parsed_event.properties['email']
      end

      def provided_user_properties
        parsed_event.properties.except('userIdentifier', 'email', 'user_attributes', 'device_fingerprint', 'device_identifier')
      end

      def handle_existing_device!(existing_device)
        user_profile_who_previously_owned_device = existing_device.analytics_user_profile
        is_new_device_owner = user_profile_who_previously_owned_device.user_unique_identifier != provided_unique_user_identifier
        if is_new_device_owner
          transfer_device_to_identified_user!(existing_device)
        else
          # the device is already owned by the identified user, let's just update the user profile with any new information
          merged_user_properties = user_profile_who_previously_owned_device.metadata.merge(provided_user_properties)
          user_profile_who_previously_owned_device.metadata = merged_user_properties
          user_profile_who_previously_owned_device.email = provided_email
          user_profile_who_previously_owned_device.save! if user_profile_who_previously_owned_device.changed?
        end
      end

      def transfer_device_to_identified_user!(existing_device)
        # if the user identifier provided in the identify event is different than the user identifier for the device
        pre_existing_user_for_provided_user_identifier = workspace.analytics_user_profiles.find_by(user_unique_identifier: provided_unique_user_identifier)
        if pre_existing_user_for_provided_user_identifier.present?
          handle_assigning_device_to_pre_existing_user!(existing_device, pre_existing_user_for_provided_user_identifier)
        else
          # if there is not already a user profile for the provided user identifier, we need to create one and assign it to the device
          new_user_profile = workspace.analytics_user_profiles.create!(
            user_unique_identifier: provided_unique_user_identifier,
            email: provided_email,
            metadata: provided_user_properties,
          )
          if existing_device.owner.is_anonymous?
            Ingestion::ProfileMerger.new(previous_profile: existing_device.owner, new_profile: new_user_profile).merge!
          end
          existing_device.update!(analytics_user_profile_id: new_user_profile.id)
        end
      end

      def handle_assigning_device_to_pre_existing_user!(device, existing_user)
        if device.owner.is_anonymous?
          Ingestion::ProfileMerger.new(previous_profile: device.owner, new_profile: existing_user).merge!
          if provided_user_properties.any? && existing_user.metadata != provided_user_properties
            merged_user_properties = existing_user.metadata.merge(provided_user_properties)
            existing_user.update!(metadata: merged_user_properties)
          end
        end
        existing_user.email = provided_email if !provided_email.blank?
        existing_user.metadata = existing_user.metadata.merge(provided_user_properties)
        existing_user.save! if existing_user.changed?
        device.update!(analytics_user_profile_id: existing_user.id)
      end

      def handle_first_time_seeing_device!
        user_profile = workspace.analytics_user_profiles.find_by(user_unique_identifier: parsed_event.properties['userIdentifier'])
        if user_profile.nil?
          user_profile = workspace.analytics_user_profiles.create!(
            user_unique_identifier: provided_unique_user_identifier,
            email: provided_email,
            metadata: provided_user_properties,
          )
        else
          user_profile.update!(email: provided_email, metadata: provided_user_properties)
        end
        new_device = workspace.analytics_user_profile_devices.create!(
          analytics_user_profile_id: user_profile.id,
          device_fingerprint: parsed_event.device_fingerprint, 
          swishjam_cookie_value: parsed_event.device_identifier,
        )
      end
    end
  end
end