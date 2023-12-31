module Ingestion
  class OrganizationIdentifiesIngestion
    attr_accessor :ingestion_batch

    def self.ingest!
      if ENV['HAULT_ALL_INGESTION_JOBS'] || ENV['HAULT_ORGANIZATION_IDENTIFIES_INGESTION']
        Sentry.capture_message("Haulting `OrganizationIdentifiesIngestion` early because either `HAULT_ALL_INGESTION_JOBS` or `HAULT_ORGANIZATION_IDENTIFIES_INGESTION` ENV is set to true. Ingestion will pick back up when these ENVs are unset.")
        return
      end
      new.ingest!
    end

    def initialize
      @ingestion_batch = IngestionBatch.new(started_at: Time.current, event_type: 'organization_identify')
    end

    def ingest!
      queued_organization_identify_events = Ingestion::QueueManager.pop_all_records_from_queue(Ingestion::QueueManager::Queues.ORGANIZATION)
      begin
        queued_organization_identify_events.each do |event_json| 
          begin
            create_or_update_organization_profile(event_json)
          rescue => e
            Rails.logger.error "Failed to ingest an event from organization identify queue: #{e.inspect}. Event: #{event_json}. inserting into dead letter queue."
            Sentry.capture_exception(e)
            Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.ORGANIZATION_DEAD_LETTER_QUEUE, [event_json])
          end
        end
      rescue => e
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.ORGANIZATION_DEAD_LETTER_QUEUE, queued_organization_identify_events)
        @ingestion_batch.error_message = e.message  
        Rails.logger.error "Failed to ingest from analytics queue: #{e.inspect}"
        Sentry.capture_exception(e)
      end
      @ingestion_batch.num_records = queued_organization_identify_events.count
      @ingestion_batch.completed_at = Time.current
      @ingestion_batch.num_seconds_to_complete = @ingestion_batch.completed_at - @ingestion_batch.started_at
      @ingestion_batch.save!
      @ingestion_batch
    end

    def create_or_update_organization_profile(event_json)
      event = Analytics::Event.parsed_from_ingestion_queue(event_json)
      unique_identifier = event.properties.organizationIdentifier || event.properties.organization_identifier || event.properties.organizationId || event.properties.organization_id
      org_name = event.properties.name
      metadata = event.properties.as_json.except(
        'source', 'sdk_version', 'url', 'device_identifier', 'user_device_identifier', 'organization_device_identifier', 'session_identifier', 'page_view_identifier',
        'organizationIdentifier', 'organization_identifier', 'organizationId', 'organization_id', 'name', 'user_attributes', 'user_visit_status'
      )

      workspace = Workspace.for_public_key(event.swishjam_api_key)
      if workspace
        org_profile = workspace.analytics_organization_profiles.find_by(organization_unique_identifier: unique_identifier)
        if org_profile
          org_profile.update!(name: org_name, metadata: metadata)
        else
         org_profile = workspace.analytics_organization_profiles.create!(
            organization_unique_identifier: unique_identifier, 
            name: org_name, 
            metadata: metadata,
            created_at: event.occurred_at,
          )
        end
        user_unique_identifier = event.properties.user_attributes.unique_identifier
        if user_unique_identifier
          user_profile = workspace.analytics_user_profiles.find_by(user_unique_identifier: user_unique_identifier)
          if user_profile.nil?
            # ideally this shouldn't happen often, but it's possible that an org is identified before a user is identified, and order is not promised in the ingestion queue
            Sentry.capture_message("No user profile found for #{user_unique_identifier} during organization identification, creating it instead in Ingestion::OrganizationIdentifiesIngestion: #{event.swishjam_api_key}")
            user_profile = workspace.analytics_user_profiles.create!(
              user_unique_identifier: user_unique_identifier,
              first_name: event.properties.user_attributes.first_name,
              last_name: event.properties.user_attributes.last_name,
              email: event.properties.user_attributes.email,
              initial_landing_page_url: event.properties.user_attributes.initial_url,
              initial_referrer_url: event.properties.user_attributes.initial_referrer,
              metadata: event.properties.user_attributes.metadata,
              created_at: event.occurred_at,
            )
          end
          org_profile.users << user_profile unless org_profile.users.include?(user_profile)
        else
          Sentry.capture_message("No user_unique_identifier found during organization identification, cannot associate user to an org in Ingestion::OrganizationIdentifiesIngestion: #{event.swishjam_api_key}")
        end
      else
        msg = "Unrecognized API Key found in Ingestion::OrganizationIdentifiesIngestion: #{event.swishjam_api_key}"
        Rails.logger.warn msg
        Sentry.capture_message(msg)
        nil
      end
    end

    # def create_or_update_organization_profiles!(events)
    #   new_profile_data = []
    #   events.each do |event_json|
    #     properties = JSON.parse(event_json['properties'] || '{}')
    #     unique_identifier = properties['organizationIdentifier'] || properties['organization_identifier'] || properties['organizationId'] || properties['organization_id']
    #     org_name = properties['name']
    #     metadata = properties.except(
    #       'source', 'sdk_version', 'url', 'device_identifier', 'user_device_identifier', 'organization_device_identifier', 'session_identifier', 'page_view_identifier',
    #       'organizationIdentifier', 'organization_identifier', 'organizationId', 'organization_id', 'name', 'user_attributes', 'user_visit_status'
    #     )

    #     workspace = Workspace.for_public_key(event_json['swishjam_api_key'])
    #     if workspace
    #       profile = workspace.analytics_organization_profiles.find_by(organization_unique_identifier: unique_identifier)
    #       if profile
    #         profile.update!(name: org_name, metadata: metadata)
    #       else
    #         profile = workspace.analytics_organization_profiles.create!(
    #           organization_unique_identifier: unique_identifier, 
    #           name: org_name, 
    #           metadata: metadata,
    #           created_at: event_json['timestamp'],
    #         )
    #         new_profile_data << { 
    #           swishjam_api_key: event_json['swishjam_api_key'], 
    #           unique_identifier: unique_identifier,
    #           swishjam_organization_id: profile.id,
    #           created_at: event_json['timestamp'],
    #         }
    #       end
    #     else
    #       msg = "Unrecognized API Key found in Ingestion::UserIdentifiesIngestion: #{event_json['swishjam_api_key']}"
    #       Rails.logger.warn msg
    #       Sentry.capture_message(msg)
    #       nil
    #     end
    #   end
    #   new_profile_data
    # end

    # def formatted_organization_identify_event(event_json)
    #   properties = JSON.parse(event_json['properties'] || '{}')
    #   unique_identifier = properties['organizationIdentifier'] || properties['organization_identifier'] || properties['organizationId'] || properties['organization_id']
    #   workspace = Workspace.for_public_key(event_json['swishjam_api_key'])
    #   if workspace
    #     profile = workspace.analytics_organization_profiles.find_by(organization_unique_identifier: unique_identifier)
    #     if profile
    #       {
    #         swishjam_api_key: event_json['swishjam_api_key'],
    #         swishjam_organization_id: profile.id,
    #         organization_device_identifier: properties[Analytics::Event::ReservedPropertyNames.ORGANIZATION_DEVICE_IDENTIFIER],
    #         occurred_at: event_json['occurred_at'],
    #       }
    #     else
    #       msg = "Unable to find AnalyticsOrganizationProfile for #{unique_identifier}. This should have been created or updated in the previous method `create_or_update_organization_profiles!`"
    #       Rails.logger.error msg
    #       Sentry.capture_message(msg)
    #       nil
    #     end
    #   else
    #     msg = "Unrecognized API Key found in Ingestion::UserIdentifiesIngestion: #{event_json['swishjam_api_key']}"
    #     Rails.logger.warn msg
    #     Sentry.capture_message(msg)
    #     nil
    #   end
    # end
  end
end