module Ingestion
  module EventPreparers
    module Helpers
      class UserPropertiesAugmentor < Ingestion::EventPreparers::Base
        attr_reader :user_profile, :parsed_event

        AUTO_APPLY_USER_PROPERTIES_DICT = {
          # .URL and .REFERRER are legacy property names but falling back to these values for backwards compatibility
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL => [Analytics::Event::ReservedPropertyNames.SESSION_LANDING_PAGE_URL, Analytics::Event::ReservedPropertyNames.URL],
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL_HOST => [Analytics::Event::ReservedPropertyNames.SESSION_LANDING_PAGE_URL_HOST, Analytics::Event::ReservedPropertyNames.URL_HOST],
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL_PATH => [Analytics::Event::ReservedPropertyNames.SESSION_LANDING_PAGE_URL_PATH, Analytics::Event::ReservedPropertyNames.URL_PATH],
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL_QUERY_PARAMS => [Analytics::Event::ReservedPropertyNames.SESSION_LANDING_PAGE_URL_QUERY_PARAMS, Analytics::Event::ReservedPropertyNames.URL_QUERY_PARAMS],
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_BASE_URL => [Analytics::Event::ReservedPropertyNames.SESSION_LANDING_PAGE_BASE_URL, Analytics::Event::ReservedPropertyNames.BASE_URL],

          # .INITIAL_REFERRER semantically makes the most sense becaues the referrer can be 'direct' or a URL
          # the _URL suffixes (besides .INITIAL_REFERRER_URL) will only be populated if the referrer is a URL
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER => [Analytics::Event::ReservedPropertyNames.SESSION_REFERRER_URL, Analytics::Event::ReservedPropertyNames.REFERRER],
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL => [Analytics::Event::ReservedPropertyNames.SESSION_REFERRER_URL, Analytics::Event::ReservedPropertyNames.REFERRER],
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL_HOST => [Analytics::Event::ReservedPropertyNames.SESSION_REFERRER_URL_HOST, Analytics::Event::ReservedPropertyNames.REFERRER_URL_HOST],
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL_PATH => [Analytics::Event::ReservedPropertyNames.SESSION_REFERRER_URL_PATH, Analytics::Event::ReservedPropertyNames.REFERRER_URL_PATH],
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL_QUERY_PARAMS => [Analytics::Event::ReservedPropertyNames.SESSION_REFERRER_URL_QUERY_PARAMS, Analytics::Event::ReservedPropertyNames.REFERRER_URL_QUERY_PARAMS],
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_BASE_URL => [Analytics::Event::ReservedPropertyNames.SESSION_REFERRER_BASE_URL, Analytics::Event::ReservedPropertyNames.REFERRER],

          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_CAMPAIGN => Analytics::Event::ReservedPropertyNames.SESSION_UTM_CAMPAIGN,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_SOURCE => Analytics::Event::ReservedPropertyNames.SESSION_UTM_SOURCE,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_MEDIUM => Analytics::Event::ReservedPropertyNames.SESSION_UTM_MEDIUM,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_CONTENT => Analytics::Event::ReservedPropertyNames.SESSION_UTM_CONTENT,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_TERM => Analytics::Event::ReservedPropertyNames.SESSION_UTM_TERM,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_GCLID => Analytics::Event::ReservedPropertyNames.SESSION_GCLID,
        }

        def initialize(user_profile, parsed_event)
          @user_profile = user_profile
          @parsed_event = parsed_event
        end

        def augment_user_properties!
          # if we have already set the `initial_referrer_url`, but not the `initial_landing_page_url` then we should not continue
          # this is really only for users who have been identified earlier than ~04/22/2024
          return user_profile if !user_profile.present? || user_already_has_any_initial_properties_set?
          AUTO_APPLY_USER_PROPERTIES_DICT.each do |user_property_key, event_property_name|
            next if user_profile.metadata.key?(user_property_key)
            user_property_value = nil
            if event_property_name.is_a?(Array)
              user_property_value = event_property_name.map{ |prop_name| parsed_event.properties[prop_name] }.compact.first
            else
              user_property_value = parsed_event.properties[event_property_name]
            end
            next if user_property_value.nil?
            user_profile.metadata[user_property_key] = user_property_value
          end
          user_profile.save! if user_profile.changed?
          user_profile
        end

        private

        def user_already_has_any_initial_properties_set?
          AUTO_APPLY_USER_PROPERTIES_DICT.keys.any?{ |property_name| user_profile.metadata.key?(property_name) }
        end
        
      end
    end
  end
end