module AnalyticsEventProcessors
  class Organization < Base
    def process!
      organization = create_or_update_organization!
      create_or_update_metadata!(organization)
      associate_session_to_organization!(organization)
    end

    private

    def create_or_update_organization!
      existing_organization = Analytics::Organization.find_by(unique_identifier: organization_identifier)
      if existing_organization
        existing_organization.update!(name: organization_name) if existing_organization.name != organization_name
        existing_organization
      else
        swishjam_organization.analytics_organizations.create!(unique_identifier: organization_identifier, name: organization_name)
      end
    end

    def create_or_update_metadata!(organization)
      existing_metadata = organization.metadata
      reserved_organization_attributes = %w[organization_id organizationId organization_identifier organizationIdentifier name]
      provided_metadata = data.except(*reserved_organization_attributes)
      provided_metadata.each do |key, value|
        new_or_exsting_metadata = organization.metadata.find_or_initialize_by(key: key)
        new_or_exsting_metadata.value = value
        new_or_exsting_metadata.save!
      end
    end

    def associate_session_to_organization!(organization)
      session = create_or_update_session
      session.update!(organization: organization) if session.organization != organization
    end

    def organization_identifier
      data['organizationIdentifier'] || data['organizationId'] || data['organization_identifier'] || data['organization_id']
    end

    def organization_name
      data['name']
    end
  end
end