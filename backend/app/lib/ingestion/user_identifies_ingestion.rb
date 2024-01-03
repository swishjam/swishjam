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
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.IDENTIFY_DEAD_LETTER_QUEUE, queued_user_identify_events)
        @ingestion_batch.error_message = e.message
        Sentry.capture_exception(e)
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
      # all of the properties in the `identify` attributes we dont want to include in the user's metadata
      # the attributes we want to ignore differs slightly between user and organization profiles, so lets just hardcode them for now.
      metadata = properties.except(
        'sdk_version', 'url', 'device_identifier', 'user_device_identifier', 'organization_device_identifier', 'session_identifier', 'page_view_identifier', 
        'firstName', 'first_name', 'lastName', 'last_name', 'email',
        'user_attributes', 'organization_attributes', 'user_visit_status', 'userIdentifier'
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
          profile.email = email unless email.blank?
          profile.first_name = first_name unless first_name.blank?
          profile.last_name = last_name unless last_name.blank?
          if !metadata.blank?
            old_metadata = profile.metadata || {}
            merged_metadata = old_metadata.merge(metadata)
            profile.metadata = merged_metadata
          end
          profile.initial_landing_page_url = profile.initial_landing_page_url || initial_landing_page_url unless initial_landing_page_url.blank?
          profile.initial_referrer_url = profile.initial_referrer_url || initial_referrer_url unless initial_referrer_url.blank?
          profile.first_seen_at_in_web_app = profile.first_seen_at_in_web_app || (event_json['occurred_at'] || Time.current).to_datetime
        else
          created_by_data_source = workspace.api_keys.find_by!(public_key: event_json['swishjam_api_key']).data_source
          profile = workspace.analytics_user_profiles.new(
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
        end
        profile.save!
        return {
          swishjam_api_key: event_json['swishjam_api_key'],
          swishjam_user_id: profile.id,
          device_identifier: properties[Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER],
          occurred_at: event_json['occurred_at'],
        }
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