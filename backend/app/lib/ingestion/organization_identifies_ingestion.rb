module Ingestion
  class OrganizationIdentifiesIngestion
    attr_accessor :ingestion_batch
    
    def initialize
      @ingestion_batch = IngestionBatch.new(started_at: Time.current, event_type: 'organization_identify')
    end

    def self.ingest!
      new.ingest!
    end

    def ingest!
      queued_organization_identify_events = Ingestion::QueueManager.pop_all_records_from_queue(Ingestion::QueueManager::Queues.ORGANIZATION)
      begin
        formatted_new_swishjam_profiles = create_or_update_organization_profiles!(queued_organization_identify_events)
        Analytics::SwishjamOrganizationProfile.insert_all!(formatted_new_swishjam_profiles) if formatted_new_swishjam_profiles.any?
        
        formatted_organization_identify_events = queued_organization_identify_events.map{ |e| formatted_organization_identify_event(e) }.compact
        Analytics::OrganizationIdentifyEvent.insert_all!(formatted_organization_identify_events) if formatted_organization_identify_events.any?
        
        @ingestion_batch.num_records = queued_organization_identify_events.count
        @ingestion_batch.completed_at = Time.current
        @ingestion_batch.num_seconds_to_complete = @ingestion_batch.completed_at - @ingestion_batch.started_at
        @ingestion_batch.save!
      rescue => e
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.ORGANIZATION, queued_organization_identify_events)
        @ingestion_batch.num_records = queued_organization_identify_events.count
        @ingestion_batch.completed_at = Time.current
        @ingestion_batch.num_seconds_to_complete = @ingestion_batch.completed_at - @ingestion_batch.started_at
        @ingestion_batch.error_message = e.message
        @ingestion_batch.save!
        
        Rails.logger.error "Failed to ingest from analytics queue: #{e.inspect}"
        Sentry.capture_exception(e)
      end
      @ingestion_batch
    end

    private

    def create_or_update_organization_profiles!(events)
      new_profile_data = []
      events.each do |event_json|
        properties = JSON.parse(event_json['properties'] || '{}')
        unique_identifier = properties['organizationIdentifier'] || properties['organization_identifier'] || properties['organizationId'] || properties['organization_id']
        org_name = properties['name']
        metadata = properties.except(
          'source', 'sdk_version', 'url', 'device_identifier', 'user_device_identifier', 'organization_device_identifier', 'session_identifier', 'page_view_identifier',
          'organizationIdentifier', 'organization_identifier', 'organizationId', 'organization_id', 'name'
        )

        workspace = Workspace.for_public_key(event_json['swishjam_api_key'])
        if workspace
          profile = workspace.analytics_organization_profiles.find_by(organization_unique_identifier: unique_identifier)
          if profile
            profile.update!(name: org_name, metadata: metadata)
          else
            profile = workspace.analytics_organization_profiles.create!(
              organization_unique_identifier: unique_identifier, 
              name: org_name, 
              metadata: metadata,
              created_at: event_json['timestamp'],
            )
            new_profile_data << { 
              swishjam_api_key: event_json['swishjam_api_key'], 
              unique_identifier: unique_identifier,
              swishjam_organization_id: profile.id,
              created_at: event_json['timestamp'],
            }
          end
          Analytics::UserOrganizationRelationship.create!(
            organization_device_identifier: event_json[Analytics::Event::ReservedPropertyNames.ORGANIZATION_DEVICE_IDENTIFIER],
            user_device_identifier: event_json[Analytics::Event::ReservedPropertyNames.USER_DEVICE_IDENTIFIER],
          )
        else
          msg = "Unrecognized API Key found in Ingestion::UserIdentifiesIngestion: #{event_json['swishjam_api_key']}"
          Rails.logger.warn msg
          Sentry.capture_message(msg)
          nil
        end
      end
      new_profile_data
    end

    def formatted_organization_identify_event(event_json)
      properties = JSON.parse(event_json['properties'] || '{}')
      unique_identifier = properties['organizationIdentifier'] || properties['organization_identifier'] || properties['organizationId'] || properties['organization_id']
      workspace = Workspace.for_public_key(event_json['swishjam_api_key'])
      if workspace
        profile = workspace.analytics_organization_profiles.find_by(organization_unique_identifier: unique_identifier)
        if profile
          {
            swishjam_api_key: event_json['swishjam_api_key'],
            swishjam_organization_id: profile.id,
            organization_device_identifier: properties[Analytics::Event::ReservedPropertyNames.ORGANIZATION_DEVICE_IDENTIFIER],
            occurred_at: event_json['occurred_at'],
          }
        else
          msg = "Unable to find AnalyticsOrganizationProfile for #{unique_identifier}. This should have been created or updated in the previous method `create_or_update_organization_profiles!`"
          Rails.logger.error msg
          Sentry.capture_message(msg)
          nil
        end
      else
        msg = "Unrecognized API Key found in Ingestion::UserIdentifiesIngestion: #{event_json['swishjam_api_key']}"
        Rails.logger.warn msg
        Sentry.capture_message(msg)
        nil
      end
    end
  end
end