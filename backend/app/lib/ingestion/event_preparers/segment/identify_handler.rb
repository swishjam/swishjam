module Ingestion
  module EventPreparers
    module Segment
      class IdentifyHandler < Base
        def handle_and_return_prepared_events!
          byebug
          user_profile = create_or_update_user_profile!
          parsed_event.set_user_profile(user_profile)
          merge_anonymous_user_into_identified_user!(user_profile)
          parsed_event.override_properties!(formatted_event_properties)
          parsed_event.override_name!('identify')
          update_api_key!
          parsed_event
        end

        def merge_anonymous_user_into_identified_user!(user_profile)
          return if segment_anonymous_id.blank?
          anonymous_user = workspace.analytics_user_profiles.find_by(user_unique_identifier: segment_anonymous_id)
          return if anonymous_user.blank?
          Ingestion::ProfileMerger.new(previous_profile: anonymous_user, new_profile: user_profile).merge!
        end
      end
    end
  end
end