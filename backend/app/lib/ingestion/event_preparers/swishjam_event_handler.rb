module Ingestion
  module EventPreparers
    class SwishjamEventHandler < Base
      def handle_and_return_prepared_events!
        user_profile_for_event = Ingestion::EventPreparers::Helpers::SwishjamEventUserAttributor.new(parsed_event).get_user_profile_and_associate_to_device_if_necessary!
        organization_for_event = Ingestion::EventPreparers::Helpers::SwishjamEventOrganizationAttributor.new(parsed_event, user_profile_for_event).organization_for_event
        parsed_event.set_user_profile(user_profile_for_event) if user_profile_for_event.present?
        parsed_event.set_organization_profile(organization_for_event) if organization_for_event.present?
        parsed_event
      end
    end
  end
end