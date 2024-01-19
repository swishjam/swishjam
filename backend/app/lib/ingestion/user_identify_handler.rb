module Ingestion
  class UserIdentifyHandler
    class InvalidIdentifyEvent < StandardError; end;
    attr_accessor :parsed_event

    def initialize(parsed_event)
      @parsed_event = parsed_event
    end

    def handle_identify_and_update_event!
      validate!
      # existing_device = workspace.analytics_user_profile_devices.find_by(device_fingerprint: parsed_event.properties.device_fingerprint)
      device = workspace.analytics_user_profile_devices.find_by(swishjam_cookie_value: parsed_event.device_identifier)
      if device.present?
        handle_existing_device!(device)
      else
        device = handle_first_time_seeing_device!
      end
      parsed_event.set_user_profile_id(device.analytics_user_profile_id)
      parsed_event.set_user_properties(
        device.analytics_user_profile.metadata.merge({
          email: device.analytics_user_profile.email,
          unique_identifier: device.analytics_user_profile.user_unique_identifier,
        })
      )
      parsed_event
    end

    private

    def validate!
      raise InvalidIdentifyEvent, "Tried to identify an event that wasn't named `identify`, provided name: #{parsed_event.name}" if parsed_event.name != 'identify'
      raise InvalidIdentifyEvent, "Provided event properties did not include a `userIdentifier` key, provided properties: #{parsed_event.properties}" if provided_unique_user_identifier.blank?
    end

    def workspace
      @workspace ||= Workspace.for_public_key!(parsed_event.swishjam_api_key)
    end

    def provided_unique_user_identifier
      parsed_event.properties['userIdentifier']
    end

    def provided_email
      parsed_event.properties['email']
    end

    def provided_user_properties
      parsed_event.properties.except('userIdentifier', 'email', 'user_attributes', 'device_fingerprint', 'device_identifier')
    end

    # TODO: think about how we want to handle when a device changes ownership
    # for example if a device is associated to a non-anonymous user, and has a handful of events associated to that user
    # then the device "changes ownership" to a new user by a new identify event on that device
    # should we associate historical events to the new user, or leave them associated to the old user
    # and just consider future events on that device to be associated to the new user?
    # it feels like the latter is the right answer, but we should think about it more
    def handle_existing_device!(existing_device)
      user_profile_who_previously_owned_device = existing_device.analytics_user_profile
      # TODO: we have to handle / merge historical owners here also...
      is_new_device_owner = user_profile_who_previously_owned_device.user_unique_identifier != provided_unique_user_identifier
      if is_new_device_owner
        # if the user identifier provided in the identify event is different than the user identifier for the device, we need to merge the user profiles
        pre_existing_user_for_provided_user_identifier = workspace.analytics_user_profiles.find_by(user_unique_identifier: provided_unique_user_identifier)
        if pre_existing_user_for_provided_user_identifier.present?
          # if there is already a user profile for the provided user identifier, we need to merge the pre-existing user profile for the device into the pre-existing user profile for the provided user identifier
          user_profile_who_previously_owned_device.merge_into!(pre_existing_user_for_provided_user_identifier)
          if provided_user_properties.any? && pre_existing_user_for_provided_user_identifier.metadata != provided_user_properties
            merged_user_properties = pre_existing_user_for_provided_user_identifier.metadata.merge(provided_user_properties)
            pre_existing_user_for_provided_user_identifier.update!(metadata: merged_user_properties)
          end
        else
          # if there is not already a user profile for the provided user identifier, we need to create one, assign it to the device, and merge the old profile into it
          new_user_profile = workspace.analytics_user_profiles.create!(user_unique_identifier: provided_unique_user_identifier)
          existing_device.update!(analytics_user_profile_id: new_user_profile.id)
          user_profile_who_previously_owned_device.merge_into!(new_user_profile)
        end
      else
        # if the user identifier provided in the identify event is the same as the user identifier for the device, we need to update the user profile
        merged_user_properties = user_profile_who_previously_owned_device.metadata.merge(provided_user_properties)
        user_profile_who_previously_owned_device.metadata = merged_user_properties
        user_profile_who_previously_owned_device.email = provided_email
        user_profile_who_previously_owned_device.save! if user_profile_who_previously_owned_device.changed?
      end
    end

    def handle_first_time_seeing_device!
      user_profile = workspace.analytics_user_profiles.find_by(user_unique_identifier: parsed_event.properties['userIdentifier'])
      if user_profile.nil?
        user_profile = workspace.analytics_user_profiles.create!(
          user_unique_identifier: provided_unique_user_identifier,
          email: provided_email,
          # first_name: parsed_event.properties.user_attributes.first_name,
          # last_name: parsed_event.properties.user_attributes.last_name,
          metadata: provided_user_properties,
        )
      else
        user_profile.update!(
          email: provided_email,
          # first_name: parsed_event.properties.user_attributes.first_name,
          # last_name: parsed_event.properties.user_attributes.last_name,
          metadata: provided_user_properties,
        )
      end
      new_device = workspace.analytics_user_profile_devices.create!(
        analytics_user_profile_id: user_profile.id,
        device_fingerprint: parsed_event.device_fingerprint, 
        swishjam_cookie_value: parsed_event.device_identifier,
      )
    end
  end
end