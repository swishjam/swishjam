module Ingestion
  module EventPreparers
    module Helpers
      class AutomaticUserAttributeApplier
        AUTO_APPLY_USER_PROPERTIES_DICT = {
          # .URL and .REFERRER are legacy property names but falling back to these values for backwards compatibility
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL => [Analytics::Event::ReservedPropertyNames.SESSION_LANDING_PAGE_URL, Analytics::Event::ReservedPropertyNames.URL],
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL => [Analytics::Event::ReservedPropertyNames.SESSION_REFERRER_URL, Analytics::Event::ReservedPropertyNames.REFERRER],
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_CAMPAIGN => Analytics::Event::ReservedPropertyNames.SESSION_UTM_CAMPAIGN,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_SOURCE => Analytics::Event::ReservedPropertyNames.SESSION_UTM_SOURCE,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_MEDIUM => Analytics::Event::ReservedPropertyNames.SESSION_UTM_MEDIUM,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_CONTENT => Analytics::Event::ReservedPropertyNames.SESSION_UTM_CONTENT,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_TERM => Analytics::Event::ReservedPropertyNames.SESSION_UTM_TERM,
          AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_GCLID => Analytics::Event::ReservedPropertyNames.SESSION_GCLID,
        }

        def self.apply_user_attributes_if_necessary!(user_properties, event_properties)
          AUTO_APPLY_USER_PROPERTIES_DICT.each do |user_property_key, event_property|
            next if user_properties.key?(user_property_key)
            user_property_value = nil
            if event_property.is_a?(Array)
              user_property_value = event_property.map{ |prop_name| event_properties[prop_name] }.compact.first
            else
              user_property_value = event_properties[event_property]
            end
            next if user_property_value.nil?
            user_properties[user_property_key] = user_property_value 
          end
        end
      end
    end
  end
end