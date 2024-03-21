module Ingestion
  module EventPreparers
    module Segment
      class GroupHandler < Base
        def handle_and_return_prepared_events!
          organization = create_or_update_organization!
          user = create_or_update_user_profile!
          parsed_event.set_organization_profile(organization)
          if user.present?
            parsed_event.set_user_profile(user) 
            organization.users << user if !organization.users.include?(user)
          end
          parsed_event.override_name!('organization')
          update_api_key!
          parsed_event
        end

        def create_or_update_organization!
          @organization_profile ||= begin
            organization_identifier = segment_group_id
            raise InvalidSegmentEventError, "Segment `.group` payload is missing a `groupId` value." if organization_identifier.blank?
            organization_profile = workspace.analytics_organization_profiles.find_by(organization_unique_identifier: organization_identifier) || workspace.analytics_organization_profiles.new(organization_unique_identifier: organization_identifier)
            organization_profile.name = group_traits['name']
            organization_profile.domain = group_traits['domain'] || group_traits['website']
            organization_profile.metadata ||= {}
            organization_profile.metadata = organization_profile.metadata.merge(group_traits.except('name', 'domain', 'website'))
            organization_profile.save!
            organization_profile
          end
        end
      end
    end
  end
end