module Ingestion
  module EventPreparers
    module Helpers
      class SwishjamEventUserAttributor < Ingestion::EventPreparers::Base
        def get_user_profile_and_associate_to_device_if_necessary!
          is_new_device_owner = user_profile_for_event.present? && device_for_event.present? && device_for_event.owner != user_profile_for_event
          return user_profile_for_event if !is_new_device_owner
          # TODO: we should probably also be merging all user profiles that have been merged into the current device.owner
          # but I think we need to take into account the order of the merges so we need to maintain a log of merges
          # holding off for now because I don't _think_ a profile will encounter multiple merges often currently
          
          # we merge a profile when the pre existing device owner is not anonymous and the provided user identifier is different
          # this supports the following scenario:
          # an anonymous user navigates to the site on their desktop, we create a new device (id: d-123) and a new anonymous user profile (id: u-456) as the device owner
          # we later identify the user, we update the device owner's profile with the user's info (uuid: 'collin')
          # that same person later navigates to the site on their phone, we create a new device (id: d-abc) and a new anonymous user profile (id: u-xyz) as the device owner
          # we later identify the user on their phone, we check if we have a user with the provided identifier ('collin'), we do, so we change the device owner to that user
          # in order to attribute all the historical events that occurred on the phone to 'collin' we need to merge u-xyz into u-456
          Ingestion::ProfileMerger.new(previous_profile: device_for_event.owner, new_profile: user_profile_for_event).merge! if device_for_event.owner.is_anonymous?
          device_for_event.update!(analytics_user_profile_id: user_profile_for_event.id)
          user_profile_for_event
        end

        private

        def user_profile_for_event
          @user_profile_for_event ||= begin
            user_profile = determine_user_profile_for_event!
            return if user_profile.nil?
            user_profile.user_unique_identifier ||= provided_unique_user_identifier
            user_profile.email = provided_user_properties['email'] if !provided_user_properties['email'].blank?
            user_profile.metadata ||= {}
            user_profile.metadata = user_profile.metadata.merge(sanitized_user_properties.dig('metadata') || sanitized_user_properties)
            Ingestion::EventPreparers::Helpers::UserPropertiesAugmentor.new(parsed_event).augment_user_properties!
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

        def determine_user_profile_for_event!
          @determined_user_profile_for_event ||= begin
            # a server side event that didn't provide any unique user information, so we don't attribute it to a user
            if parsed_event.device_identifier.nil? && provided_unique_user_identifier.nil? && provided_user_properties['email'].nil?
              return
            end
            if pre_existing_device.nil?
              # it's either a server-side event, or a brand new device
              # if we have a user for the provided unique identifier or email use that, otherwise create a new user profile
              return pre_existing_user_profile_for_provided_user_data || workspace.analytics_user_profiles.new(created_by_data_source: data_source)
            end
            # it's from a device we've seen before
            if provided_unique_user_identifier.nil? && provided_user_properties['email'].nil?
              # it's an anonymous user, so we use the existing device owner
              return pre_existing_device.owner
            end
            if pre_existing_user_profile_for_provided_user_data.present?
              # it's an event from an identified user that we've seen before
              # this is where the device owner would get merged into this profile if the owner is anonymous
              return pre_existing_user_profile_for_provided_user_data
            end
            # it's an existing device, but the first time we've seen this user identifier/email before
            if pre_existing_device.owner.is_anonymous?
              # just update the device owner with the new user's info
              return pre_existing_device.owner
            end
            # the prior device owner was an identified user, so we should create a new user profile
            # this profile will not get any merging because we want to keep the historical events attributed to the previous user
            # but we will update the device owner to this user so all future events will be attributed to this user
            workspace.analytics_user_profiles.new(created_by_data_source: data_source)
          end
        end

        def pre_existing_device
          return @pre_existing_device if defined?(@pre_existing_device)
          @pre_existing_device ||= begin
            return nil if parsed_event.device_identifier.blank?
            workspace.analytics_user_profile_devices.find_by(swishjam_cookie_value: parsed_event.device_identifier)
          end
        end

        def provided_user_properties
          # legacy instrumentation sends `identify` events with the user properties in the root of the event properties, and all other events with the user properties in the `user_attributes` key
          parsed_event.properties.dig('user') || (parsed_event.name == 'identify' ? parsed_event.properties : parsed_event.properties.dig('user_attributes')) || {}
        end

        def pre_existing_user_profile_for_provided_user_data
          return @pre_existing_user_profile_for_provided_user_data if defined?(@pre_existing_user_profile_for_provided_user_data)
          @pre_existing_user_profile_for_provided_user_data ||= begin
            return if !provided_unique_user_identifier.present? && !provided_user_properties['email'].present?
            profile_by_identifier = workspace.analytics_user_profiles.find_by(user_unique_identifier: provided_unique_user_identifier)
            return profile_by_identifier if profile_by_identifier.present? || provided_user_properties['email'].blank?
            workspace.analytics_user_profiles.find_by(user_unique_identifier: nil, email: provided_user_properties['email']) 
          end
        end

        def provided_unique_user_identifier
          # legacy instrumentation sends `identify` events with the user properties in the root of the event properties
          provided_user_properties['identifier'] ||
            provided_user_properties['unique_identifier'] ||
            provided_user_properties['id'] ||
            provided_user_properties['userIdentifier'] || 
            provided_user_properties['user_id'] || 
            provided_user_properties['userId']
        end

        def sanitized_user_properties
          provided_user_properties.except('email', 'id', 'identifier', 'unique_identifier', 'userIdentifier', 'user_id', 'userId', *Analytics::Event::ReservedPropertyNames.all.map(&:to_s))
        end
        
      end
    end
  end
end