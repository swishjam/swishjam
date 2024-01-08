module Ingestion
  class UserProfilesFromEventIngestion
    attr_accessor :ingestion_batch
    
    def initialize
      @ingestion_batch = IngestionBatch.new(started_at: Time.current, event_type: 'user_profiles_from_event')
    end

    def self.ingest!
      if ENV['HAULT_ALL_INGESTION_JOBS'] || ENV['HAULT_USER_PROFILES_FROM_EVENT_INGESTION']
        Sentry.capture_message("Haulting `UserProfilesFromEventIngestion` early because either `HAULT_ALL_INGESTION_JOBS` or `HAULT_USER_PROFILES_FROM_EVENT_INGESTION` ENV is set to true. Ingestion will pick back up when these ENVs are unset.")
        return
      end
      new.ingest!
    end

    def ingest!
      queued_user_profiles = Ingestion::QueueManager.pop_all_records_from_queue(Ingestion::QueueManager::Queues.USER_PROFILES_FROM_EVENTS)
      begin
        queued_user_profiles.each do |event_json|
          begin
            create_or_update_transactional_user_profile!(event_json)
          rescue => e
            Sentry.capture_exception(e)
            Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.USER_PROFILES_FROM_EVENTS_DEAD_LETTER_QUEUE, [event_json])
          end
        end
      rescue => e
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.USER_PROFILES_FROM_EVENTS_DEAD_LETTER_QUEUE, queued_user_identify_events)
        @ingestion_batch.error_message = e.message
        Sentry.capture_exception(e)
        Sentry.capture_message("Failed to ingest entire batch from user identify queue: #{e.message}, pushed all records into the DLQ...")
      end
      @ingestion_batch.num_records = queued_user_profiles.count
      @ingestion_batch.completed_at = Time.current
      @ingestion_batch.num_seconds_to_complete = @ingestion_batch.completed_at - @ingestion_batch.started_at
      @ingestion_batch.save!

      @ingestion_batch
    end

    private

    def create_or_update_transactional_user_profile!(event_json)
      event = Analytics::Event.parsed_from_ingestion_queue(event_json)
      unique_identifier = event.properties.id
      first_name = event.properties.firstName || event.properties.first_name
      last_name = event.properties.lastName || event.properties.last_name
      email = event.properties.email
      properties = event.properties.to_h.as_json
      metadata = properties.except('id', 'firstName', 'first_name', 'lastName', 'last_name', 'email', 'user_attributes', 'organization_attributes')

      if !unique_identifier
        raise "Invalid user profile received, no unique identifier provided in event payload in Ingestion::UserProfilesFromEventIngestion: #{event_json.inspect}, pushing it into the DLQ..."
      end

      workspace = Workspace.for_public_key(event.swishjam_api_key)
      if workspace.nil?
        raise "Unrecognized API Key found in Ingestion::UserIdentifiesIngestion: #{event.swishjam_api_key}, pushing it into the DLQ..."
      end

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
        profile.first_seen_at_in_web_app = profile.first_seen_at_in_web_app || (event.occurred_at || Time.current).to_datetime
      else
        created_by_data_source = workspace.api_keys.find_by!(public_key: event.swishjam_api_key).data_source
        profile = workspace.analytics_user_profiles.new(
          user_unique_identifier: unique_identifier, 
          first_name: first_name, 
          last_name: last_name, 
          email: email, 
          metadata: metadata,
          created_by_data_source: created_by_data_source,
          created_at: (event.occurred_at || Time.current).to_datetime,
          first_seen_at_in_web_app: (event.occurred_at || Time.current).to_datetime,
        )
      end
      profile.save!
    end
  end
end