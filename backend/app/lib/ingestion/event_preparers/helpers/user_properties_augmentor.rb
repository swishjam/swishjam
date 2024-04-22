module Ingestion
  module EventPreparers
    module Helpers
      class UserPropertiesAugmentor < Ingestion::EventPreparers::Base
        AUTO_APPLY_USER_PROPERTIES_DICT = {
          # .URL and .REFERRER are legacy property names but falling back to these values for backwards compatibility
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL => [Analytics::Event::ReservedPropertyNames.SESSION_LANDING_PAGE_URL, Analytics::Event::ReservedPropertyNames.URL],
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL_HOST => [Analytics::Event::ReservedPropertyNames.SESSION_LANDING_PAGE_URL_HOST, Analytics::Event::ReservedPropertyNames.URL_HOST],
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL_PATH => [Analytics::Event::ReservedPropertyNames.SESSION_LANDING_PAGE_URL_PATH, Analytics::Event::ReservedPropertyNames.URL_PATH],
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL_QUERY_PARAMS => [Analytics::Event::ReservedPropertyNames.SESSION_LANDING_PAGE_URL_QUERY_PARAMS, Analytics::Event::ReservedPropertyNames.URL_QUERY_PARAMS],
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_BASE_URL => [Analytics::Event::ReservedPropertyNames.SESSION_LANDING_PAGE_BASE_URL, Analytics::Event::ReservedPropertyNames.BASE_URL],

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

        def augment_user_properties!
          # if we have already set the `initial_referrer_url`, but not the `initial_landing_page_url` then we should not continue
          # this is really only for users who have been identified earlier than ~04/22/2024
          return if user_already_has_any_initial_properties_set?
          AUTO_APPLY_USER_PROPERTIES_DICT.each do |user_property_key, event_property_name|
            next if parsed_event.user_properties.key?(user_property_key)
            user_property_value = nil
            if event_property_name.is_a?(Array)
              user_property_value = event_property_name.map{ |prop_name| parsed_event.properties[prop_name] }.compact.first
            else
              user_property_value = parsed_event.properties[event_property_name]
            end
            next if user_property_value.nil?
            parsed_event.set_user_property(user_property_key, user_property_value)
          end
        end

        def user_already_has_any_initial_properties_set?
          AUTO_APPLY_USER_PROPERTIES_DICT.keys.any?{ |property_name| parsed_event.user_properties.key?(property_name) }
        end
      end
    end
  end
end