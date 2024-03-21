module Ingestion
  module EventPreparers
    module Segment
      class Base < Ingestion::EventPreparers::Base
        class InvalidSegmentEventError < StandardError; end

        def update_api_key!
          parsed_event.override_swishjam_api_key!(swishjam_api_key_record.integration.for_data_source)
        end

        def is_identified_user?
          segment_user_id.present?
        end

        def is_anonymous_user?
          segment_anonymous_id.present? && !is_identified_user?
        end

        def get_user_profile
          if is_identified_user?
            @user_profile ||= workspace.analytics_user_profiles.find_by(user_unique_identifier: segment_user_id) 
          elsif is_anonymous_user?
            workspace.analytics_user_profiles.find_by(user_unique_identifier: segment_anonymous_id)
          end
        end

        def get_organization_profile
          return if segment_group_id.blank?
          @organization_profile ||= workspace.analytics_organization_profiles.find_by(organization_unique_identifier: segment_group_id)
        end

        def create_or_update_user_profile!
          return if segment_user_id.blank?
          user_profile = get_user_profile || workspace.analytics_user_profiles.new(user_unique_identifier: segment_user_id || segment_anonymous_id)
          user_profile.email = segment_event_payload['email'] || user_traits['email'] if segment_event_payload['email'].present? || user_traits['email'].present?
          user_profile.metadata ||= {}
          user_profile.metadata[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL] ||= page_url
          user_profile.metadata[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL] ||= page_referrer
          user_profile.metadata = user_profile.metadata.merge(user_traits)
          user_profile.last_seen_at_in_web_app = Time.current
          user_profile.first_seen_at_in_web_app ||= Time.current
          user_profile.save!
          user_profile
        end

        def formatted_event_properties
          user_provided_properties = segment_event_payload['traits'] || segment_event_payload['properties'] || {}
          contextual_properties = {
            Analytics::Event::ReservedPropertyNames.URL => page_url,
            Analytics::Event::ReservedPropertyNames.REFERRER => page_referrer,
            'is_mobile' => segment_event_context.dig('userAgentData', 'mobile'),
          }
          contextual_properties.merge(user_provided_properties)
        end

        def swishjam_integration
          @swishjam_integration ||= Integrations::Segment.for_workspace(workspace)
        end

        def segment_event_payload
          parsed_event.properties
        end

        def segment_event_context
          segment_event_payload['context'] || {}
        end

        def user_traits
          segment_event_payload['traits'] || {}
        end
        alias group_traits user_traits

        def segment_user_id
          segment_event_payload['userId']
        end

        def segment_anonymous_id
          segment_event_payload['anonymousId']
        end

        def segment_group_id
          segment_event_payload['groupId'] || segment_event_context['groupId']
        end

        def page_url
          segment_event_context.dig('page', 'url')
        end

        def page_referrer
          segment_event_context.dig('page', 'referrer')
        end
      end
    end
  end
end