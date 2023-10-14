module WebEventProcessors
  class Organization < Base
    def capture!
      unique_identifier = properties['organizationIdentifier'] || properties['organization_identifier'] || properties['organizationId'] || properties['organization_id']
      name = properties['name']
      metadata = properties.except('organizationIdentifier', 'organization_identifier', 'organizationId', 'organization_id', 'name')
      
      profile = workspace.analytics_organization_profiles.find_by(organization_unique_identifier: unique_identifier)
      if profile
        profile.update!(name: name, metadata: metadata)
      else
        profile = workspace.analytics_organization_profiles.create!(organization_unique_identifier: unique_identifier, name: name, metadata: metadata)
      end

      Analytics::OrganizationIdentifyEvent.create!(
        swishjam_api_key: public_key,
        swishjam_organization_id: profile.id,
        device_identifier: properties[Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER],
        session_identifier: properties[Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER],
        occurred_at: timestamp,
      )
      
      # probably not necessary? but why not...
      Analytics::Event.create!(
        uuid: uuid,
        name: event_name,
        swishjam_api_key: public_key,
        occurred_at: timestamp,
        ingested_at: Time.current,
        properties: properties.merge({ swishjam_organization_id: profile.id })
      )
    end
  end
end