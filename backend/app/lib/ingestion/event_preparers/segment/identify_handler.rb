module Ingestion
  module EventPreparers
    module Segment
      class IdentifyHandler < Base
        def handle_and_return_prepared_events!
          parsed_event.set_user_profile(user_profile)
          parsed_event.override_properties!(segment_event_payload['traits'])
          parsed_event
        end

        def user_profile
          create_or_update_user_profile(segment_event_payload['traits'])
        end
      end
    end
  end
end