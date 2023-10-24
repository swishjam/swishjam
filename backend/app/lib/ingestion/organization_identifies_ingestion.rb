module Ingestion
  class OrganizationIdentifesIngestion
    attr_accessor :ingestion_batch
    
    def initialize
      ingestion_batch = IngestionBatch.new(started_at: Time.current, event_type: 'organization_identify')
    end

    def ingest!
      queued_organization_identify_events = Ingestion::QueueManager.pop_all_records_from_queue(Ingestion::QueueManager::Queues.ORGANIZATION)
      begin
        formatted_organization_events = queued_organization_identify_events.map{ |e| format_organization_event(e) }.compact!
        ingestion_batch.num_records = formatted_organization_events.count
        Analytics::OrganizationIdentifyEvent.insert_all!(formatted_organization_events)
        ingestion_batch.completed_at = Time.current
        ingestion_batch.num_seconds_to_complete = ingestion_batch.completed_at - ingestion_batch.started_at
        ingestion_batch.save!
      rescue => e
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.ORGANIZATION, queued_organization_identify_events)
        ingestion_batch.completed_at = Time.current
        ingestion_batch.num_seconds_to_complete = ingestion_batch.completed_at - ingestion_batch.started_at
        ingestion_batch.error_message = e.message
        ingestion_batch.save!
        
        Rails.logger.error "Failed to ingest from analytics queue: #{e.inspect}"
        Sentry.capture_exception(e)
      end
    end

    private

    def format_organization_event(event_json)
      unique_identifier = event_json['organizationIdentifier'] || event_json['organization_identifier'] || event_json['organizationId'] || event_json['organization_id']
      name = event_json['name']
      metadata = event_json.except(
        'uuid', 'event', 'timestamp', 'name', 'source', 'sdk_version', 'url', 'device_identifier', 'session_identifier', 'page_view_identifier', 'swishjam_api_key',
        'organizationIdentifier', 'organization_identifier', 'organizationId', 'organization_id',
      )
      
      workspace = ApiKey.enabled.find_by(public_key: event_json['swishjam_api_key']).workspace
      profile = workspace.analytics_organization_profiles.find_by(organization_unique_identifier: unique_identifier)
      if profile
        profile.update!(name: name, metadata: metadata)
      else
        profile = workspace.analytics_organization_profiles.create!(organization_unique_identifier: unique_identifier, name: name, metadata: metadata)
      end

      {
        swishjam_api_key: event_json['swishjam_api_key'],
        swishjam_organization_id: profile.id,
        device_identifier: event_json[Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER],
        session_identifier: event_json[Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER],
        occurred_at: event_json['occurred_at'],
      }
    rescue => e
      Rails.logger.error "Failed to parse Organization Identify JSON. \nJSON: #{event_json.to_s}\n Error: #{e.inspect}"
      Sentry.capture_except(e)
      nil
    end
  end
end