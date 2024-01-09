module Ingestion
  class UserIdentifiesIngestion
    attr_accessor :ingestion_batch
    
    def initialize
      @ingestion_batch = IngestionBatch.new(started_at: Time.current, event_type: 'user_identify')
    end

    def self.ingest!
      if ENV['HAULT_ALL_INGESTION_JOBS'] || ENV['HAULT_USER_IDENTIFIES_INGESTION']
        Sentry.capture_message("Haulting `UserIdentifiesIngestion` early because either `HAULT_ALL_INGESTION_JOBS` or `HAULT_USER_IDENTIFIES_INGESTION` ENV is set to true. Ingestion will pick back up when these ENVs are unset.")
        return
      end
      new.ingest!
    end

    def ingest!
      queued_user_identify_events = Ingestion::QueueManager.pop_all_records_from_queue(Ingestion::QueueManager::Queues.IDENTIFY)
      begin
        user_identify_events = queued_user_identify_events.map{ |e| create_or_update_transactional_user_profile!(e) }.compact
        Analytics::UserIdentifyEvent.insert_all!(user_identify_events) if user_identify_events.present?
      rescue => e
        @ingestion_batch.error_message = e.message
        Sentry.capture_exception(e)
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.IDENTIFY_DEAD_LETTER_QUEUE, queued_user_identify_events)
        Sentry.capture_message("Failed to ingest entire batch from user identify queue: #{e.message}, pushed all records into the DLQ...")
      end
      @ingestion_batch.num_records = queued_user_identify_events.count
      @ingestion_batch.completed_at = Time.current
      @ingestion_batch.num_seconds_to_complete = @ingestion_batch.completed_at - @ingestion_batch.started_at
      @ingestion_batch.save!

      @ingestion_batch
    end

    private

    def create_or_update_transactional_user_profile!(event_json)
      properties = JSON.parse(event_json['properties'] || '{}')
      unique_identifier = properties['userIdentifier'] || properties['user_identifier'] || properties['userId'] || properties['user_id']
      first_name = properties['firstName'] || properties['first_name']
      last_name = properties['lastName'] || properties['last_name']
      email = properties['email']
      initial_landing_page_url = properties.dig('user_attributes', 'initial_url')
      initial_referrer_url = properties.dig('user_attributes', 'initial_referrer')
      metadata = properties.except(
        'source', 'sdk_version', 'url', 'device_identifier', 'user_device_identifier', 'organization_device_identifier', 'session_identifier', 'page_view_identifier',
        'userId', 'user_id', 'userIdentifier', 'firstName', 'first_name', 'lastName', 'last_name', 'email', 'user_attributes', 'user_visit_status'
      )

      if !unique_identifier
        Sentry.capture_message("Invalid user identifty event received, no unique identifier provided in event payload in Ingestion::UserIdentifiesIngestion: #{event_json.inspect}, pushing it into the DLQ...")
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.IDENTIFY_DEAD_LETTER_QUEUE, [event_json])
        return
      end

      workspace = Workspace.for_public_key(event_json['swishjam_api_key'])
      if workspace
        profile = workspace.analytics_user_profiles.find_by(user_unique_identifier: unique_identifier)
        if profile.nil? && email.present?
          profile = workspace.analytics_user_profiles.find_by_case_insensitive_email(email)
        end
        if profile
          profile.update!(
            email: email, 
            first_name: first_name, 
            last_name: last_name, 
            initial_landing_page_url: profile.initial_landing_page_url || initial_referrer_url,
            initial_referrer_url: profile.initial_referrer_url || initial_referrer_url,
            metadata: metadata, 
            first_seen_at_in_web_app: profile.first_seen_at_in_web_app || (event_json['occurred_at'] || Time.current).to_datetime,
            # TODO: now that initial_landing_page_url and initial_referrer have their own columns, 
            # we dont have a use for this yet. need to have an SDK method for users to set custom immutable metadata
            # immutable_metadata: immutable_metadata.merge(profile.immutable_metadata || {}),
          )
          return {
            swishjam_api_key: event_json['swishjam_api_key'],
            swishjam_user_id: profile.id,
            device_identifier: properties[Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER],
            occurred_at: event_json['occurred_at'],
          }
        else
          created_by_data_source = workspace.api_keys.find_by!(public_key: event_json['swishjam_api_key']).data_source
          profile = workspace.analytics_user_profiles.create!(
            user_unique_identifier: unique_identifier, 
            first_name: first_name, 
            last_name: last_name, 
            email: email, 
            initial_landing_page_url: initial_referrer_url,
            initial_referrer_url: initial_referrer_url,
            metadata: metadata,
            created_by_data_source: created_by_data_source,
            created_at: (event_json['occurred_at'] || Time.current).to_datetime,
            first_seen_at_in_web_app: (event_json['occurred_at'] || Time.current).to_datetime,
            # immutable_metadata: immutable_metadata,
          )
          return {
            swishjam_api_key: event_json['swishjam_api_key'],
            swishjam_user_id: profile.id,
            device_identifier: properties[Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER],
            occurred_at: event_json['occurred_at'],
          }
        end
      else
        Sentry.capture_message("Unrecognized API Key found in Ingestion::UserIdentifiesIngestion: #{event_json['swishjam_api_key']}, pushing it into the DLQ...")
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.IDENTIFY_DEAD_LETTER_QUEUE, [event_json])
      end
    rescue => e
      Sentry.capture_message("Error occurred when ingesting user identify event in Ingestion::UserIdentifiesIngestion: #{e.message}, pushing it into the DLQ...")
      Sentry.capture_exception(e)
      Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.IDENTIFY_DEAD_LETTER_QUEUE, [event_json])
    end
  end
end