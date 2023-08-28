module WebEventProcessors
  class Identify < Base
    def capture!
      unique_identifier = user_provided_data['userIdentifier'] || user_provided_data['user_identifier'] || user_provided_data['userId'] || user_provided_data['user_id']
      first_name = user_provided_data['firstName'] || user_provided_data['first_name']
      last_name = user_provided_data['lastName'] || user_provided_data['last_name']
      email = user_provided_data['email']
      metadata = user_provided_data.except('userId', 'user_id', 'firstName', 'first_name', 'lastName', 'last_name', 'email')
      
      profile = workspace.analytics_user_profiles.find_by(user_unique_identifier: unique_identifier)
      if profile
        profile.update!(first_name: first_name, last_name: last_name, email: email, metadata: metadata)
      else
        profile = workspace.analytics_user_profiles.create!(
          user_unique_identifier: unique_identifier, 
          first_name: first_name, 
          last_name: last_name, 
          email: email, 
          metadata: metadata
        )
      end

      Analytics::UserIdentifyEvent.create!(
        swishjam_api_key: @workspace.public_key,
        swishjam_user_id: profile.id,
        device_identifier: fingerprint_value,
        occurred_at: timestamp,
      )
      
      # probably not necessary? but why not...
      properties = { swishjam_user_id: profile.id }
      properties[Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER.to_sym] = unique_session_identifier
      properties[Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER.to_sym] = fingerprint_value
      Analytics::Event.create!(
        uuid: uuid,
        swishjam_api_key: @workspace.public_key,
        name: event_name,
        occurred_at: timestamp,
        properties: properties.merge(metadata)
      )
    end
  end
end