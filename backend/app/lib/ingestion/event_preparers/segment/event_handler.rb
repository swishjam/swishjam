module Ingestion
  module EventPreparers
    module Segment
      class EventHandler < Base
        def handle_and_return_prepared_events!
          user_profile = create_or_update_user_profile!
          organization_profile = get_organization_profile
          
          parsed_event.set_user_profile(user_profile) if user_profile.present?
          parsed_event.set_organization_profile(organization_profile) if organization_profile.present?
          parsed_event.override_properties!(formatted_event_properties)
          parsed_event.override_name!(event_name.gsub('segment.', ''))
          update_api_key!
          parsed_event
        end
      end
    end
  end
end