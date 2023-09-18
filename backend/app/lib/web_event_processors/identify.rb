module WebEventProcessors
  class Identify < Base
    def capture!
      unique_identifier = properties['userIdentifier'] || properties['user_identifier'] || properties['userId'] || properties['user_id']
      first_name = properties['firstName'] || properties['first_name']
      last_name = properties['lastName'] || properties['last_name']
      email = properties['email']
      metadata = properties.except('userId', 'user_id', 'firstName', 'first_name', 'lastName', 'last_name', 'email')
      
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
        swishjam_api_key: workspace.public_key,
        swishjam_user_id: profile.id,
        device_identifier: properties[Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER],
        occurred_at: timestamp,
      )
      
      # probably not necessary? but why not...
      Analytics::Event.create!(
        uuid: uuid,
        swishjam_api_key: workspace.public_key,
        name: event_name,
        analytics_family: analytics_family,
        occurred_at: timestamp,
        properties: properties.merge({ swishjam_user_id: profile.id })
      )
    end

    private

    def session_identifier
      properties[Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER]
    end

    def device_identifier
      properties[Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER]
    end
  end
end