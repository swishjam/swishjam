module Ingestion
  module EventPreparers
    class BasicEventHandler < Base
      def handle_and_return_prepared_events!
        parsed_event.set_user_profile(user_profile_for_event) if user_profile_for_event.present?
        parsed_event.set_organization_profile(organization_for_event) if organization_for_event.present?
        parsed_event
      end

      private

      def organization_for_event
        @organization_for_event ||= begin
          provided_org_attributes = parsed_event.name == 'organization' ? parsed_event.properties : parsed_event.properties['organization'] || {}
          organization_identifier = provided_org_attributes['organization_identifier'] || 
                                      provided_org_attributes['id'] ||
                                      provided_org_attributes['org_id'] ||
                                      provided_org_attributes['organization_id'] ||
                                      provided_org_attributes['orgIdentifier'] ||
                                      provided_org_attributes['organizationIdentifier'] ||
                                      provided_org_attributes['organization_identifier']
          # provided_org_attributes = parsed_event.properties['organization_attributes'] || parsed_event.properties['organization'] || {}
          # organization_identifier = parsed_event.properties['org_id'] || 
          #                             parsed_event.properties['organization_id'] || 
          #                             parsed_event.properties['orgIdentifier'] ||
          #                             parsed_event.properties['organizationIdentifier'] ||
          #                             parsed_event.properties['organization_identifier'] || 
          #                             provided_org_attributes['organization_identifier'] || 
          #                             provided_org_attributes['id'] ||
          #                             provided_org_attributes['org_id'] ||
          #                             provided_org_attributes['organization_id'] ||
          #                             provided_org_attributes['orgIdentifier'] ||
          #                             provided_org_attributes['organizationIdentifier'] ||
          #                             provided_org_attributes['organization_identifier']
          if organization_identifier.present?
            org = workspace.analytics_organization_profiles.find_by(organization_unique_identifier: organization_identifier)
            maybe_org_name = provided_org_attributes['organization_name'] || provided_org_attributes['name'] || provided_org_attributes['organizationName'] || provided_org_attributes['org_name'] || provided_org_attributes['orgName']
            sanitized_provided_org_metadata = (provided_org_attributes['metadata'] || provided_org_attributes || {}).except('id', 'organization_identifier', 'name', 'organization_name', 'domain', 'org_id', 'organization_id', 'orgIdentifier', 'organizationIdentifier', 'organization_identifier')
            if org.present?
              org.name = maybe_org_name if maybe_org_name.present?
              org.metadata = org.metadata.merge(sanitized_provided_org_metadata) if sanitized_provided_org_metadata.present?
              org.domain = provided_org_attributes['domain'] || provided_org_attributes.dig('metadata', 'domain') if provided_org_attributes['domain'].present? || provided_org_attributes.dig('metadata', 'domain').present?
            else
              org = workspace.analytics_organization_profiles.new(
                organization_unique_identifier: organization_identifier,
                name: maybe_org_name,
                metadata: sanitized_provided_org_metadata,
                domain: provided_org_attributes['domain'] || provided_org_attributes.dig('metadata', 'domain'),
              )
            end
            if org.domain.nil? && user_profile_for_event&.email.present? && !GenericEmailDetector.is_generic_email?(user_profile_for_event.email)
              domain_from_user_email = user_profile_for_event.email.split('@').last
              org.domain = domain_from_user_email
            end
            org.save! if org.changed?
            if user_profile_for_event.present? && !org.analytics_organization_members.exists?(analytics_user_profile_id: user_profile_for_event.id)
              org.analytics_organization_members.create!(analytics_user_profile_id: user_profile_for_event.id)
            end
            org
          end
        end
      end

      def user_profile_for_event
        @user_profile_for_event ||= begin
          if provided_unique_user_identifier.present?
            handle_user_profile_handling_from_explicit_user_identifier!
          elsif parsed_event.device_identifier.present?
            handle_user_profile_handling_from_instrumentation_event!
          end
        end
      end

      def handle_user_profile_handling_from_explicit_user_identifier!
        user_profile = workspace.analytics_user_profiles.find_by(user_unique_identifier: provided_unique_user_identifier)
        if user_profile.present?
          if parsed_event.properties['user'].present?
            user_profile.email = parsed_event.properties.dig('user', 'email') if parsed_event.properties.dig('user', 'email').present?
            user_profile.metadata = user_profile.metadata.merge(parsed_event.properties['user'].except('id', 'email'))
          end
          user_profile.last_seen_at_in_web_app = Time.current
          user_profile.first_seen_at_in_web_app ||= Time.current
          user_profile.save! if user_profile.changed?
          user_profile
        else
          workspace.analytics_user_profiles.create!(
            user_unique_identifier: provided_unique_user_identifier,
            email: parsed_event.properties.dig('user', 'email'),
            metadata: supplemented_metadata_for_new_user_profile,
            last_seen_at_in_web_app: Time.current,
            first_seen_at_in_web_app: Time.current,
            created_by_data_source: data_source,
          )
        end
      end

      def handle_user_profile_handling_from_instrumentation_event!
        existing_device = workspace.analytics_user_profile_devices.find_by(swishjam_cookie_value: parsed_event.device_identifier)
        if existing_device.present?
          existing_device.owner.last_seen_at_in_web_app = Time.current
          existing_device.owner.email = provided_user_data['email'] if !provided_user_data['email'].blank?
          existing_device.owner.metadata = existing_device.owner.metadata.merge!(provided_user_data.except('id', 'email'))
          byebug
          existing_device.owner.save!
          existing_device.owner
        else
          new_anonymous_user = workspace.analytics_user_profiles.create!(
            first_seen_at_in_web_app: Time.current, 
            last_seen_at_in_web_app: Time.current,
            email: provided_user_data['email'],
            metadata: supplemented_metadata_for_new_user_profile,
            created_by_data_source: data_source,
          )
          workspace.analytics_user_profile_devices.create!(
            swishjam_cookie_value: parsed_event.device_identifier, 
            device_fingerprint: parsed_event.device_fingerprint,
            analytics_user_profile_id: new_anonymous_user.id,
          )
          new_anonymous_user
        end
      end

      def supplemented_metadata_for_new_user_profile
        user_metadata = {}
        user_metadata[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL] = parsed_event.properties['session_landing_page_url'] || parsed_event.properties['url'] if parsed_event.properties['session_landing_page_url'].present? || parsed_event.properties['url'].present?
        user_metadata[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL] = parsed_event.properties['session_referrer'] || parsed_event.properties['referrer'] if parsed_event.properties['session_referrer'].present? || parsed_event.properties['referrer'].present?
        user_metadata.merge!(provided_user_data.except('id', 'email'))
        user_metadata
      end

      def provided_user_data
        parsed_event.properties['user'] || {}
      end
    end
  end
end