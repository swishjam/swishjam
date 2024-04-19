module Ingestion
  module EventPreparers
    module Helpers
      class SwishjamEventUserAttributor < Ingestion::EventPreparers::Base
        attr_reader :parsed_event

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

        def initialize(parsed_event)
          @parsed_event = parsed_event
        end

        def associate_user_to_device_if_necessary!
          is_new_device_owner = user_profile_for_event.present? && 
                                  device_for_event.present? && 
                                  device_for_event.owner.user_unique_identifier != user_profile_for_event.user_unique_identifier
          return user_profile_for_event if !is_new_device_owner
          # TODO: we should probably also be merging all user profiles that have been merged into the current device.owner
          # but I think we need to take into account the order of the merges so we need to maintain a log of merges
          # holding off for now because I don't _think_ a profile will encounter multiple merges often currently
          
          # if the previous device owner was not anonymous, we don't merge the profiles and all previous events will still belong to that user
          # but all future events will belong to this new user
          Ingestion::ProfileMerger.new(previous_profile: device_for_event.owner, new_profile: user_profile_for_event).merge! if device_for_event.owner.is_anonymous?
          device_for_event.update!(analytics_user_profile_id: user_profile_for_event.id)
          user_profile_for_event
        end

        private

        def user_profile_for_event
          @user_profile_for_event ||= begin
            # a server side event that didn't provide any user information, so we don't attribute it to a user
            if parsed_event.device_identifier.nil? && provided_unique_user_identifier.nil? && provided_user_properties['email'].nil? && sanitized_user_properties.blank?
              return
            end
            user_profile = nil
            byebug
            # either they called `.identify` in the client SDK, or they provided a `user` object in the event properties
            if provided_unique_user_identifier.present?
              user_profile = workspace.analytics_user_profiles.find_by(user_unique_identifier: provided_unique_user_identifier)
            end
            # if there wasnt a user with the unique identifier or if it wasnt provided, but an email was provided, lets see if a user with that email exists who doesnt have a unique identifier
            # this is possible if the user was created by an integration, or if `updateUser` was called in the SDK on a not-yet identified user
            if user_profile.nil? && provided_user_properties['email'].present?
              user_profile = workspace.analytics_user_profiles.find_by(user_unique_identifier: nil, email: provided_user_properties['email'])
            end
            # if there wasnt a user with the provided unique identifier or email, but a unique identifier was provided, lets create a new user profile
            if user_profile.nil? && provided_unique_user_identifier.present?
              user_profile = workspace.analytics_user_profiles.new(created_by_data_source: data_source)
            end
            # if a unique identifier was not provided and there isnt a user with the (possibly) provided email, check if there is a pre-existing device that we can associate the user from
            if user_profile.nil? && pre_existing_device.present?
              user_profile = pre_existing_device.owner
            end
            # if we still can't find the user profile, that means this is a brand new device, or it's a brand new user provided from a server side event
            if user_profile.nil?
              user_profile = workspace.analytics_user_profiles.new(created_by_data_source: data_source)
            end
            user_profile.user_unique_identifier ||= provided_unique_user_identifier
            user_profile.email = provided_user_properties['email'] if !provided_user_properties['email'].blank?
            user_profile.metadata ||= {}
            user_profile.metadata = user_profile.metadata.merge(sanitized_user_properties)
            AUTO_APPLY_USER_PROPERTIES_DICT.each do |user_property_key, event_property|
              event_property = [event_property] if !event_property.is_a?(Array)
              user_property_value = event_property.map { |prop_name| parsed_event.properties[prop_name] }.compact.first
              user_profile.metadata[user_property_key] ||= user_property_value if user_property_value.present?
            end
            user_profile.last_seen_at_in_web_app = Time.current
            user_profile.first_seen_at_in_web_app ||= Time.current
            user_profile.save! if user_profile.changed?
            user_profile
          end
        end

        def device_for_event
          @device_for_event ||= begin
            return nil if parsed_event.device_identifier.blank?
            device = pre_existing_device
            if device.nil? && user_profile_for_event.present?
              device = workspace.analytics_user_profile_devices.create!(
                analytics_user_profile_id: user_profile_for_event.id,
                device_fingerprint: parsed_event.device_fingerprint, 
                swishjam_cookie_value: parsed_event.device_identifier,
              )
            end
            device
          end
        end

        def pre_existing_device
          return if parsed_event.device_identifier.blank?
          @pre_existing_device ||= workspace.analytics_user_profile_devices.find_by(swishjam_cookie_value: parsed_event.device_identifier)
        end

        def provided_user_properties
          # legacy instrumentation sends `identify` events with the user properties in the root of the event properties
          all_user_properties = parsed_event.properties.dig('user') || (parsed_event.name == 'identify' ? parsed_event.properties : {}) || {}
        end

        def provided_unique_user_identifier
          # legacy instrumentation sends `identify` events with the user properties in the root of the event properties
          provided_user_properties['identifier'] ||
            provided_user_properties['id'] ||
            provided_user_properties['userIdentifier'] || 
            provided_user_properties['user_id'] || 
            provided_user_properties['userId']
        end

        def sanitized_user_properties
          provided_user_properties.except('email', 'id', 'identifier', 'userIdentifier', 'user_id', 'userId', *Analytics::Event::ReservedPropertyNames.all.map(&:to_s))
        end
        
      end
    end
  end
end