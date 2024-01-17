module Ingestion
  class UserIdentifyHandler
    class InvalidIdentifyEvent < StandardError; end;
    attr_accessor :event_json, :event

    def initialize(event_json)
      @event_json = event_json
      @event = Analytics::Event.parsed_from_ingestion_queue(event_json)
    end

    def handle_identify_and_return_new_event_json!
      # existing_device = workspace.analytics_user_profile_devices.find_by(device_fingerprint: event.properties.device_fingerprint)
      existing_device = workspace.analytics_user_profile_devices.find_by(swishjam_cookie_value: event.properties.device_identifier)
      if existing_device.present?
        handle_existing_device!(existing_device)
      else
        handle_first_time_seeing_device!
      end
    end

    private

    def validate!
      raise InvalidIdentifyEvent, "Tried to identify an event that wasn't named `identify`, provided name: #{event.name}" if event.name != 'identify'
      raise InvalidIdentifyEvent, "Provided event properties did not include a `userIdentifier` key, provided properties: #{event.properties.to_h.as_json}" if provided_unique_user_identifier.blank?
    end

    def workspace
      @workspace ||= Workspace.for_public_key!(event.swishjam_api_key)
    end

    def provided_unique_user_identifier
      event.properties.userIdentifier
    end

    def provided_email
      event.properties.email
    end

    def provided_user_properties
      event.properties.to_h.as_json.except('unique_attributes', 'email')
    end

    def handle_existing_device!(existing_device)
      user_profile_who_previously_owned_device = existing_device.analytics_user_profile
      # TODO: we have to handle / merge historical owners here also...
      if user_profile_who_previously_owned_device.user_unique_identifier != provided_unique_user_identifier
        # if the user identifier provided in the identify event is different than the user identifier for the device, we need to merge the user profiles
        pre_existing_user_for_provided_user_identifier = workspace.analytics_user_profiles.find_by(user_unique_identifier: provided_unique_user_identifier)
        if pre_existing_user_for_provided_user_identifier.present?
          # if there is already a user profile for the provided user identifier, we need to merge the pre-existing user profile for the device into the pre-existing user profile for the provided user identifier
          user_profile_who_previously_owned_device.merge_into!(pre_existing_user_for_provided_user_identifier)
          if provided_user_properties.any? && pre_existing_user_for_provided_user_identifier.properties != provided_user_properties
            merged_user_properties = pre_existing_user_for_provided_user_identifier.properties.merge(provided_user_properties)
            pre_existing_user_for_provided_user_identifier.update!(properties: merged_user_properties)
          end
        else
          # if there is not already a user profile for the provided user identifier, we need to create one, assign it to the device, and merge the old profile into it
          new_user_profile = workspace.analytics_user_profiles.create!(user_unique_identifier: provided_unique_user_identifier)
          existing_device.update!(analytics_user_profile_id: new_user_profile.id)
          user_profile_who_previously_owned_device.merge_into!(new_user_profile)
        end
      end
    end

    def handle_first_time_seeing_device!
      user_profile = workspace.analytics_user_profiles.find_by(user_unique_identifier: event.properties.userIdentifier)
      if user_profile.nil?
        user_profile = workspace.analytics_user_profiles.create!(
          user_unique_identifier: provided_unique_user_identifier,
          email: provided_email,
          # first_name: event.properties.user_attributes.first_name,
          # last_name: event.properties.user_attributes.last_name,
          properties: provided_user_properties,
        )
      end
      new_device = workspace.analytics_user_profile_devices.create!(
        analytics_user_profile_id: user_profile.id,
        device_fingerprint: event.properties.device_fingerprint, 
        swishjam_cookie_value: event.properties.device_identifier,
      )
    end
  end
end