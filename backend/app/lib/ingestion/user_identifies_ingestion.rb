module Ingestion
  class UserIdentifiesIngestion
    attr_accessor :ingestion_batch
    
    def initialize
      @ingestion_batch = IngestionBatch.new(started_at: Time.current, event_type: 'user_identify')
    end

    def self.ingest!
      new.ingest!
    end

    def ingest!
      queued_user_identify_events = Ingestion::QueueManager.pop_all_records_from_queue(Ingestion::QueueManager::Queues.IDENTIFY)
      begin
        formatted_swishjam_user_profiles = create_or_update_user_profiles!(queued_user_identify_events)
        Analytics::SwishjamUserProfile.insert_all!(formatted_swishjam_user_profiles) if formatted_swishjam_user_profiles.any?
        
        formatted_user_identify_events = queued_user_identify_events.map{ |e| formatted_user_identify_event(e) }.compact
        Analytics::UserIdentifyEvent.insert_all!(formatted_user_identify_events) if formatted_user_identify_events.any?
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

    def create_or_update_user_profiles!(events)
      clickhouse_profile_data = []
      events.each do |event_json|
        begin
          properties = JSON.parse(event_json['properties'] || '{}')
          unique_identifier = properties['userIdentifier'] || properties['user_identifier'] || properties['userId'] || properties['user_id']
          first_name = properties['firstName'] || properties['first_name']
          last_name = properties['lastName'] || properties['last_name']
          email = properties['email']
          metadata = properties.except(
            'source', 'sdk_version', 'url', 'device_identifier', 'user_device_identifier', 'organization_device_identifier', 'session_identifier', 'page_view_identifier',
            'userId', 'user_id', 'userIdentifier', 'firstName', 'first_name', 'lastName', 'last_name', 'email', 'user_attributes', 'user_visit_status'
          )
          immutable_metadata = {}
          if properties['user_attributes'].present?
            immutable_metadata[:initial_url] = properties.dig('user_attributes', 'initial_url')
            immutable_metadata[:initial_referrer] = properties.dig('user_attributes', 'initial_referrer')
          end

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
                metadata: metadata, 
                immutable_metadata: immutable_metadata.merge(profile.immutable_metadata || {})
              )
              clickhouse_profile_data << { 
                swishjam_api_key: event_json['swishjam_api_key'], 
                swishjam_user_id: profile.id,
                user_unique_identifier: unique_identifier,
                email: email,
                first_name: first_name,
                last_name: last_name,
                created_by_data_source: created_data_source,
                gravatar_url: profile.gravatar_url,
                # lifetime_value_in_cents: profile.lifetime_value_in_cents,
                # monthly_recurring_revenue_in_cents: profile.monthly_recurring_revenue_in_cents,
                # current_subscription_plan_name: profile.current_subscription_plan_name,
                metadata: (immutable_metadata || {}).merge(metadata).to_json,
                created_at: (event_json['occurred_at'] || Time.current).to_datetime,
                updated_at: (event_json['occurred_at'] || Time.current).to_datetime,
              }
            else
              created_by_data_source = workspace.api_keys.find_by!(public_key: event_json['swishjam_api_key']).data_source
              profile = workspace.analytics_user_profiles.create!(
                user_unique_identifier: unique_identifier, 
                first_name: first_name, 
                last_name: last_name, 
                email: email, 
                metadata: metadata,
                immutable_metadata: immutable_metadata,
                created_at: (event_json['occurred_at'] || Time.current).to_datetime,
                created_by_data_source: created_by_data_source,
              )
              clickhouse_profile_data << { 
                swishjam_api_key: event_json['swishjam_api_key'], 
                swishjam_user_id: profile.id,
                user_unique_identifier: unique_identifier,
                email: email,
                first_name: first_name,
                last_name: last_name,
                created_by_data_source: created_by_data_source,
                # gravatar_url: profile.gravatar_url,
                # lifetime_value_in_cents: profile.lifetime_value_in_cents,
                # monthly_recurring_revenue_in_cents: profile.monthly_recurring_revenue_in_cents,
                # current_subscription_plan_name: profile.current_subscription_plan_name,
                metadata: (immutable_metadata || {}).merge(metadata).to_json,
                created_at: (event_json['occurred_at'] || Time.current).to_datetime,
                updated_at: (event_json['occurred_at'] || Time.current).to_datetime,
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
      clickhouse_profile_data
    end

    def formatted_user_identify_event(event_json)
      properties = JSON.parse(event_json['properties'] || '{}')
      unique_identifier = properties['userIdentifier'] || properties['user_identifier'] || properties['userId'] || properties['user_id']
      workspace = Workspace.for_public_key(event_json['swishjam_api_key'])
      if workspace
        profile = workspace.analytics_user_profiles.find_by(user_unique_identifier: unique_identifier)
        if profile
          {
            swishjam_api_key: event_json['swishjam_api_key'],
            swishjam_user_id: profile.id,
            device_identifier: properties[Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER],
            occurred_at: event_json['occurred_at'],
          }
        else
          Sentry.capture_message("Unable to find AnalyticsUserProfile for provided unique identifer: #{unique_identifier}, pushing it into the DLQ...")
          Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.IDENTIFY_DEAD_LETTER_QUEUE, [event_json])
          nil
        end
      else
        Sentry.capture_message("Unrecognized API Key found in Ingestion::OrganizationIdentifiesIngestion: #{event_json['swishjam_api_key']}, pushing it into the DLQ...")
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.IDENTIFY_DEAD_LETTER_QUEUE, [event_json])
        nil
      end
    end
  end
end