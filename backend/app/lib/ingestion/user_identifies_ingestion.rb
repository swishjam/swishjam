module Ingestion
  class UserIdentifesIngestion
    attr_accessor :ingestion_batch
    
    def initialize
      ingestion_batch = IngestionBatch.new(started_at: Time.current, event_type: 'user_identify')
    end

    def ingest!
      queued_user_identify_events = Ingestion::QueueManager.pop_all_records_from_queue(Ingestion::QueueManager::Queues.IDENTIFY)
      begin
        ingestion_batch.num_records = queued_user_identify_events.count
        
        formatted_new_swishjam_profiles = create_or_update_user_profiles!(queued_user_identify_events)
        Analytics::SwishjamUserProfile.insert_all!(formatted_new_swishjam_profiles)

        formatted_user_identify_events = queued_user_identify_events.map{ |e| formatted_user_identify_event(e) }.compact!
        Analytics::UserIdentifyEvent.insert_all!(formatted_organization_events)

        ingestion_batch.completed_at = Time.current
        ingestion_batch.num_seconds_to_complete = ingestion_batch.completed_at - ingestion_batch.started_at
        ingestion_batch.save!
      rescue => e
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.IDENTIFY, queued_user_identify_events)
        ingestion_batch.completed_at = Time.current
        ingestion_batch.num_seconds_to_complete = ingestion_batch.completed_at - ingestion_batch.started_at
        ingestion_batch.error_message = e.message
        ingestion_batch.save!
        
        Rails.logger.error "Failed to ingest from analytics queue: #{e.inspect}"
        Sentry.capture_exception(e)
      end
    end

    private

    def create_or_update_user_profiles!(events)
      new_profile_data = []
      events.each do |event_json|
        unique_identifier = event_json['userIdentifier'] || event_json['user_identifier'] || event_json['userId'] || event_json['user_id']
        first_name = event_json['firstName'] || event_json['first_name']
        last_name = event_json['lastName'] || event_json['last_name']
        email = event_json['email']
        metadata = event_json.except(
          'uuid', 'event', 'timestamp', 'name', 'source', 'sdk_version', 'url', 'device_identifier', 'session_identifier', 'page_view_identifier', 'swishjam_api_key',
          'userId', 'user_id', 'userIdentifier', 'firstName', 'first_name', 'lastName', 'last_name', 'email', 
        )

        workspace = Workspace.for_public_key(event_json['swishjam_api_key'])
        profile = workspace.analytics_user_profiles.find_by(user_unique_identifier: unique_identifier)
        if profile
          profile.update!(first_name: first_name, last_name: last_name, email: email, metadata: metadata)
        else
          profile = workspace.analytics_user_profiles.create!(
            user_unique_identifier: unique_identifier, 
            first_name: first_name, 
            last_name: last_name, 
            email: email, 
            metadata: metadata,
            created_at: event_json['timestamp'],
          )
          new_profile_data << { 
            swishjam_api_key: event_json['swishjam_api_key'], 
            unique_identifier: unique_identifier,
            profile_id: profile.id,
            created_at: event_json['timestamp'],
          }
        end
      end
      new_profile_data
    end

    def formatted_user_identify_event(event_json)
      unique_identifier = event_json['userIdentifier'] || event_json['user_identifier'] || event_json['userId'] || event_json['user_id']
      profile = AnalyticsUserProfile.find_by!(user_unique_identifier: unique_identifier)   
      {
        swishjam_api_key: event_json['swishjam_api_key'],
        swishjam_user_id: profile.id,
        device_identifier: event_json[Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER],
        occurred_at: event_json['occurred_at'],
      }
    rescue => e
      msg = "Unable to find AnalyticsUserProfile for #{unique_identifier}"
      Rails.logger.error msg
      Sentry.capture_message(msg)
      nil
    end
  end
end