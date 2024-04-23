module Ingestion
  module EventPreparers
    module Helpers
      class OrganizationPropertiesAugmentor < Ingestion::EventPreparers::Base
        attr_reader :org, :parsed_event, :user_profile_for_event

        AUTO_APPLY_FROM_USER_PROPERTIES_DICT = [
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL_HOST,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL_PATH,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL_QUERY_PARAMS,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_BASE_URL,

          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL_HOST,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL_PATH,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL_QUERY_PARAMS,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_BASE_URL,

          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_CAMPAIGN,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_SOURCE,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_MEDIUM,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_CONTENT,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_TERM,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_GCLID,
        ]

        def initialize(org, parsed_event, user_profile_for_event)
          @org = org
          @parsed_event = parsed_event
          @user_profile_for_event = user_profile_for_event
        end

        def augment_organization_properties!
          return org if !org.present? || !user_profile_for_event.present? || org_has_any_initial_properties_set?
          AUTO_APPLY_FROM_USER_PROPERTIES_DICT.each do |property_name|
            next if !user_profile_for_event.metadata[property_name].present?
            org.metadata[property_name] ||= user_profile_for_event.metadata[property_name] 
          end
          org.save! if org.changed?
          org
        end

        private

        def org_has_any_initial_properties_set?
          AUTO_APPLY_FROM_USER_PROPERTIES_DICT.any?{ |property_name| org.metadata.key?(property_name) }
        end

      end
    end
  end
end