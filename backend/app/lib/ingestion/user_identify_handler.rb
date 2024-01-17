module Ingestion
  class UserIdentifyHandler
    attr_accessor :event_json, :event

    def initialize(event_json)
      @event_json = event_json
      @event = Analytics::Event.parsed_from_ingestion_queue(event_json)
    end

    def handle_identify_and_return_new_event_json!
      # existing_device = workspace.analytics_user_profile_devices.find_by(device_fingerprint: event.properties.device_fingerprint)
      workspace = Workspace.for_public_key!(event.swishjam_api_key)
      existing_device = workspace.analytics_user_profile_devices.find_by(swishjam_cookie_value: event.properties.device_identifier)
      if existing_device.present?
        handle_existing_device!(existing_device)
      else
        handle_first_time_seeing_device!
      end
    end

    private

    def handle_existing_device!(existing_device)
      current_user_profile_who_owns_device = existing_device.analytics_user_profile
      provided_user_identifier = event.properties.user_attributes.unique_identifier
      # TODO: we have to handle / merge historical owners here also...
      if current_user_profile_who_owns_device.user_unique_identifier != provided_user_identifier
        # if the user identifier provided in the identify event is different than the user identifier for the device, we need to merge the user profiles
        pre_existing_user_for_provided_user_identifier = workspace.analytics_user_profiles.find_by(user_unique_identifier: provided_user_identifier)
        if pre_existing_user_for_provided_user_identifier.present?
          # if there is already a user profile for the provided user identifier, we need to merge the pre-existing user profile for the device into the pre-existing user profile for the provided user identifier
          current_user_profile_who_owns_device.merge_into!(pre_existing_user_for_provided_user_identifier)
        else
          # if there is not already a user profile for the provided user identifier, we need to create one, assign it to the device, and merge the old profile into it
          new_user_profile = workspace.analytics_user_profiles.create!(user_unique_identifier: provided_user_identifier)
          existing_device.update!(analytics_user_profile_id: new_user_profile.id)
          current_user_profile_who_owns_device.merge_into!(new_user_profile)
        end
      end
    end

    def handle_first_time_seeing_device!
      user_profile = workspace.analytics_user_profiles.find_by(user_unique_identifier: event.properties.user_attributes.unique_identifier)
      if user_profile.nil?
        user_profile = workspace.analytics_user_profiles.create!(
          user_unique_identifier: event.properties.user_attributes.unique_identifier,
          email: event.properties.user_attributes.email,
          # first_name: event.properties.user_attributes.first_name,
          # last_name: event.properties.user_attributes.last_name,
          properties: event.properties.user_attributes.to_h.as_json.except('unique_identifier', 'email'),
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