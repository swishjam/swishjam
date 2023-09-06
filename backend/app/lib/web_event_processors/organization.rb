module WebEventProcessors
  class Organization < Base
    def capture!
      unique_identifier = user_provided_data['organizationIdentifier'] || user_provided_data['organization_identifier'] || user_provided_data['organizationId'] || user_provided_data['organization_id']
      name = user_provided_data['name']
      metadata = user_provided_data.except('organizationIdentifier', 'organization_identifier', 'organizationId', 'organization_id', 'name')
      
      profile = workspace.analytics_organization_profiles.find_by(organization_unique_identifier: unique_identifier)
      if profile
        profile.update!(name: name, metadata: metadata)
      else
        profile = workspace.analytics_organization_profiles.create!(organization_unique_identifier: unique_identifier, name: name, metadata: metadata)
      end

      properties = { swishjam_organization_id: profile.id }

      Analytics::Event.create!(
        uuid: uuid,
        swishjam_api_key: @workspace.public_key,
        session_identifier: unique_session_identifier,
        device_identifier: fingerprint_value,
        name: event_name,
        occurred_at: timestamp,
        properties: properties.merge(metadata)
      )
    end
  end
end