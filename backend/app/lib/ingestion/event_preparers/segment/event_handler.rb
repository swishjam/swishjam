module Ingestion
  module EventPreparers
    module Segment
      class EventHandler < Base
        def handle_and_return_prepared_events!
          byebug
          # do we want to pass any user traits here...?
          parsed_event.set_user_profile(create_or_update_user_profile) if user_profile_for_event.present?
          parsed_event.override_properties!(segment_event_payload['properties'])
          parsed_event
        end
      end
    end
  end
end