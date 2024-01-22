module Ingestion
  class EventsIngestion
    attr_accessor :ingestion_batch

    EVENT_NAMES_TO_IGNORE = %w[sdk_error].freeze
    
    def initialize
      @ingestion_batch = IngestionBatch.new(started_at: Time.current, event_type: 'events')
    end

    def self.ingest!
      if ENV['HAULT_ALL_INGESTION_JOBS'] || ENV['HAULT_EVENTS_INGESTION']
        Sentry.capture_message("Haulting `EventsIngestion` early because either `HAULT_ALL_INGESTION_JOBS` or `HAULT_EVENTS_INGESTION` ENV is set to true. Ingestion will pick back up when these ENVs are unset.")
        return
      end
      new.ingest!
    end

    def ingest!
      raw_events = Ingestion::QueueManager.pop_all_records_from_queue(Ingestion::QueueManager::Queues.EVENTS)
      begin
        formatted_events = [] 
        raw_events.map do |event_json|
          event = Ingestion::ParsedEventFromIngestion.new(event_json)
          case event.name
          when 'identify'
            Ingestion::EventHandlers::UserIdentifyHandler.new(event).handle_identify_and_return_new_event_json!
          else
            Ingestion::EventHandlers::BasicEventHandler.new(event).handle_and_return_new_event_json!
          end
          formatted_events << event.formatted_for_ingestion
        rescue => e
          byebug
          Sentry.capture_message("Error parsing event into ingestino format during events ingestion, continuing with the rest of the events in the queue: #{e.message}", level: 'error')
        end

        if formatted_events.any?
          Analytics::Event.insert_all!(formatted_events) 
          EventTriggers::Evaluator.evaluate_ingested_events(formatted_events)
        end
      rescue => e
        byebug
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS_DEAD_LETTER_QUEUE, formatted_events)
        @ingestion_batch.error_message = e.message
        Sentry.capture_exception(e)
      end
      @ingestion_batch.num_records = raw_events.count
      @ingestion_batch.completed_at = Time.current
      @ingestion_batch.num_seconds_to_complete = @ingestion_batch.completed_at - @ingestion_batch.started_at
      @ingestion_batch.save!
      @ingestion_batch
    end

    private

    # def parse_events_from_queue_and_push_identify_events_into_queues!
    #   @formatted_events_to_ingest ||= begin
    #     identify_events = []
    #     organization_events = []
    #     user_profiles_from_events = []
    #     events = Ingestion::QueueManager.pop_all_records_from_queue(Ingestion::QueueManager::Queues.EVENTS)
    #     events.each do |event_json|
    #       event = Analytics::Event.parsed_from_ingestion_queue(event_json)
    #       case event.name
    #       when 'identify'
    #         identify_events << event_json
    #       when 'organization'
    #         organization_events << event_json
    #       when 'sdk_error'
    #         begin
    #           Sentry.capture_message("SDK Error: #{JSON.parse(event_json['properties'] || '{}').dig('error', 'message')}", level: 'error')
    #         rescue => e
    #           Sentry.capture_exception(e)
    #         end
    #       end

    #       # if an event has user info, we want to create a user profile from it
    #       # this is different than identify events because those only come from our browser JS
    #       # this scenario is how to create user profiles from server-side events
    #       if event.properties.user_id.present? || event.properties.userId || event.properties.user.present?
    #         # re-define the property here for our clickhouse queries (ie: /lib/clickhouse_queries/users/events/list.rb)
    #         event.properties.user_unique_identifier = event.properties.user_id || event.properties.userId || event.properties.user.id
    #         user_profiles_from_events << {
    #           uuid: event.uuid,
    #           swishjam_api_key: event.swishjam_api_key,
    #           name: 'user_profile_from_event',
    #           occurred_at: event.occurred_at,
    #           properties: (event.properties.user || { id: event.properties.user_id || event.properties.userId }).to_h.to_json
    #         }

    #         properties = event.properties.to_h.as_json
    #         properties.delete('user')
    #         properties.delete('user_id')
    #         properties.delete('userId')
    #         event_json['properties'] = properties.to_json
    #       end
    #     rescue => e
    #       Sentry.capture_exception(e)
    #     end
    #     Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.IDENTIFY, identify_events) if identify_events.count > 0
    #     Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.ORGANIZATION, organization_events) if organization_events.count > 0
    #     Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.USER_PROFILES_FROM_EVENTS, user_profiles_from_events) if user_profiles_from_events.count > 0
    #     filtered_events = events.reject { |e| EVENT_NAMES_TO_IGNORE.include?(e['name']) }
    #     filtered_events
    #   end
    # end
  end
end