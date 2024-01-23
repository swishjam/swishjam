module Ingestion
  module EventPreparers
    class BasicEventHandler < Base
      def handle_and_return_new_event_json!
        parsed_event.set_user_profile(user_profile_for_event)
        parsed_event.set_organization_profile(organization_for_event) if organization_for_event.present?
        parsed_event
      end

      private

      def organization_for_event
        @organization_for_event ||= begin
          if parsed_event.properties.dig('organization_attributes', 'organization_identifier').present?
            organization_identifier = parsed_event.properties.dig('organization_attributes', 'organization_identifier')
            org = workspace.analytics_organization_profiles.find_by(organization_identifier: organization_identifier)
            if org.present?
              org.name = parsed_event.properties.dig('organization_attributes', 'name') if parsed_event.properties.dig('organization_attributes', 'name').present?
              org.metadata = org.metadata.merge(parsed_event.properties.dig('organization_attributes', 'metadata')) if parsed_event.properties.dig('organization_attributes', 'metadata').present?
              org.domain = parsed_event.properties.dig('organization_attributes', 'domain') if parsed_event.properties.dig('organization_attributes', 'domain').present?
              if org.domain.nil?
                domain_from_user_email = user_profile_for_event&.email&.split('@')&.last
                org.domain = domain_from_user_email
              end
              org.save! if org.changed?
            else
              org = workspace.analytics_organization_profiles.create!(
                organization_identifier: organization_identifier,
                name: parsed_event.properties.dig('organization_attributes', 'name'),
                metadata: parsed_event.properties.dig('organization_attributes', 'metadata'),
                domain: parsed_event.properties.dig('organization_attributes', 'domain') || user_profile_for_event&.email&.split('@')&.last,
              )
            end
            if user_profile_for_event.present?
              org_member = org.analytics_organization_members.find_by(analytics_user_profile_id: user_profile_for_event.id)
              if org_member.nil?
                org.analytics_organization_members.create!(analytics_user_profile_id: user_profile_for_event.id)
              end
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
        existing_user = workspace.analytics_user_profiles.find_by(user_unique_identifier: provided_unique_user_identifier)
        if existing_user.present?
          if parsed_event.properties['user'].present?
            existing_user.email = parsed_event.properties.dig('user', 'email') if parsed_event.properties.dig('user', 'email').present?
            existing_user.metadata = existing_user.metadata.merge(parsed_event.properties['user'].except('id', 'email'))
          end
          existing_user.last_seen_at_in_web_app = Time.current
          existing_user.first_seen_at_in_web_app ||= Time.current
          existing_user.save! if existing_user.changed?
          existing_user
        else
          workspace.analytics_user_profiles.create!(
            user_unique_identifier: provided_unique_user_identifier,
            email: parsed_event.properties.dig('user', 'email'),
            metadata: metadata_for_new_user_profile,
            last_seen_at_in_web_app: Time.current,
            first_seen_at_in_web_app: Time.current,
          )
        end
      end

      def handle_user_profile_handling_from_instrumentation_event!
        existing_device = workspace.analytics_user_profile_devices.find_by(swishjam_cookie_value: parsed_event.device_identifier)
        if existing_device.present?
          existing_device.owner.update!(last_seen_at_in_web_app: Time.current)
          existing_device.owner
        else
          anonymous_user = workspace.analytics_user_profiles.create!(
            first_seen_at_in_web_app: Time.current, 
            last_seen_at_in_web_app: Time.current,
            metadata: metadata_for_new_user_profile,
          )
          workspace.analytics_user_profile_devices.create!(
            swishjam_cookie_value: parsed_event.device_identifier, 
            device_fingerprint: parsed_event.device_fingerprint,
            analytics_user_profile_id: anonymous_user.id
          )
          anonymous_user
        end
      end

      def metadata_for_new_user_profile
        user_metadata = {}
        user_metadata[:initial_referrer_url] = parsed_event.properties['referrer'] if parsed_event.properties['referrer'].present?
        user_metadata[:initial_landing_page_url] = parsed_event.properties['url'] if parsed_event.properties['url'].present?
        user_metadata.merge!(parsed_event.properties['user']&.except('id', 'email') || {})
        user_metadata
      end
    end
  end
end