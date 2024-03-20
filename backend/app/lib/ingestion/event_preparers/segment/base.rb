module Ingestion
  module EventPreparers
    module Segment
      class Base < Ingestion::EventPreparers::Base
        def create_or_update_user_profile(traits = {})
          @user_profile ||= begin
            user_unique_identifier = segment_event_payload['userId']
            return if user_unique_identifier.blank?
            user_profile = workspace.analytics_user_profiles.find_by(user_unique_identifier: user_unique_identifier)
            if user_profile.nil?
              user_profile = workspace.analytics_user_profiles.new(user_unique_identifier: user_unique_identifier)
            end
            user_profile.metadata ||= {}
            user_profile.metadata[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL] ||= segment_event_payload.dig('context', 'page', 'url')
            user_profile.metadata[AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL] ||= segment_event_payload.dig('context', 'referrer', 'url')
            user_profile.metadata = user_profile.metadata.merge(traits)
            user_profile.last_seen_at_in_web_app = Time.current
            user_profile.first_seen_at_in_web_app ||= Time.current
            user_profile.save! if user_profile.changed?
            user_profile
          end
        end

        def segment_event_payload
          parsed_event.properties
        end
      end
    end
  end
end