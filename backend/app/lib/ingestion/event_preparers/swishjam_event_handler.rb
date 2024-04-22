module Ingestion
  module EventPreparers
    class SwishjamEventHandler < Base
      def handle_and_return_prepared_events!
        # order is important here, need to augment the event properties before attributing the user and organization
        # the user and organization attributors rely on the augmented properties
        Ingestion::EventPreparers::Helpers::EventPropertiesAugmentor.new(parsed_event).augment_properties!
        
        user_profile_for_event = Ingestion::EventPreparers::Helpers::SwishjamEventUserAttributor.new(parsed_event).get_user_profile_and_associate_to_device_if_necessary!
        Ingestion::EventPreparers::Helpers::UserPropertiesAugmentor.new(user_profile_for_event, parsed_event).augment_user_properties!

        organization_for_event = Ingestion::EventPreparers::Helpers::SwishjamEventOrganizationAttributor.new(parsed_event, user_profile_for_event).organization_for_event
        Ingestion::EventPreparers::Helpers::OrganizationPropertiesAugmentor.new(organization_for_event, parsed_event, user_profile_for_event).augment_organization_properties!

        parsed_event.set_user_profile(user_profile_for_event) if user_profile_for_event.present?
        parsed_event.set_organization_profile(organization_for_event) if organization_for_event.present?
        parsed_event
      end
    end
  end
end