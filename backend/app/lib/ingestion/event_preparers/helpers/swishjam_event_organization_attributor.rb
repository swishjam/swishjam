module Ingestion
  module EventPreparers
    module Helpers
      class SwishjamEventOrganizationAttributor < Ingestion::EventPreparers::Base
        attr_reader :parsed_event, :user_profile_for_event

        AUTO_APPLY_FROM_USER_PROPERTIES_DICT = [
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_CAMPAIGN,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_SOURCE,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_MEDIUM,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_CONTENT,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_TERM,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_GCLID,
        ]

        def initialize(parsed_event, user_profile_for_event)
          @parsed_event = parsed_event
          @user_profile_for_event = user_profile_for_event
        end

        def organization_for_event
          @organization_for_event ||= begin
            organization_identifier = org_attr('id', 'identifier', 'organization_identifier', 'org_id', 'organization_id', 'orgIdentifier', 'organizationIdentifier', 'organization_identifier')
            return if organization_identifier.blank?
            org = workspace.analytics_organization_profiles.find_by(organization_unique_identifier: organization_identifier) || workspace.analytics_organization_profiles.new(organization_unique_identifier: organization_identifier)
            maybe_org_name = org_attr('organization_name', 'name', 'organizationName', 'org_name', 'orgName')
            org.name = maybe_org_name if maybe_org_name.present?
            org.metadata ||= {}
            org.metadata = org.metadata.merge(sanitized_provided_org_properties)
            org.domain = org_attr('domain') if org_attr('domain').present?
            if org.domain.nil? && user_profile_for_event&.email.present? && !GenericEmailDetector.is_generic_email?(user_profile_for_event.email)
              domain_from_user_email = user_profile_for_event.email.split('@').last
              org.domain = domain_from_user_email
            end
            if user_profile_for_event.present?
              AUTO_APPLY_FROM_USER_PROPERTIES_DICT.each do |property_name|
                org.metadata[property_name] ||= user_profile_for_event.metadata[property_name] if user_profile_for_event.metadata[property_name].present?
              end
            end
            org.save! if org.changed?
            if user_profile_for_event.present? && !org.analytics_organization_members.exists?(analytics_user_profile_id: user_profile_for_event.id)
              org.analytics_organization_members.create!(analytics_user_profile_id: user_profile_for_event.id)
            end
            org
          end
        end

        def provided_org_attributes 
          # legacy instrumentation sends `organization` events with the organization properties in the root of the event properties, and all other events with the organization properties in the `organization_attributes` key
          parsed_event.properties['organization'] || parsed_event.properties['organization_attributes'] || (parsed_event.name == 'organization' ? parsed_event.properties : {}) || {}
        end

        def org_attr(*keys)
          value = nil
          keys.each do |key|
            value = provided_org_attributes[key] || provided_org_attributes.dig('metadata', key)
            break if value.present?
          end
          value
        end

        def sanitized_provided_org_properties
          (provided_org_attributes['metadata'] || provided_org_attributes).except('id', 'identifier', 'organization_identifier', 'name', 'organization_name', 'domain', 'org_id', 'organization_id', 'orgIdentifier', 'organizationIdentifier', 'organization_identifier', *Analytics::Event::ReservedPropertyNames.all.map(&:to_s))
        end

      end
    end
  end
end