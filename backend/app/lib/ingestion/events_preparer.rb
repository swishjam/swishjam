module Ingestion
  class EventsPreparer
    attr_accessor :ingestion_batch

    EVENT_NAMES_TO_IGNORE = %w[sdk_error].freeze
    
    def initialize
      @ingestion_batch = IngestionBatch.new(started_at: Time.current, event_type: 'event_preparer')
    end

    def self.prepare_events!
      if ENV['HAULT_ALL_INGESTION_JOBS'] || ENV['HAULT_PREPARED_EVENTS_INGESTION']
        Sentry.capture_message("Haulting `EventsPreparer` early because either `HAULT_ALL_INGESTION_JOBS` or `HAULT_PREPARED_EVENTS_INGESTION` ENV is set to true. Ingestion will pick back up when these ENVs are unset.")
        return
      end
      new.prepare_events!
    end

    def self.format_for_events_to_prepare_queue(uuid:, swishjam_api_key:, name:, occurred_at:, properties:)
      {
        uuid: uuid,
        swishjam_api_key: swishjam_api_key,
        name: name,
        occurred_at: occurred_at,
        properties: properties,
      }
    end

    def prepare_events!
      raw_events = Ingestion::QueueManager.pop_all_records_from_queue(Ingestion::QueueManager::Queues.EVENTS_TO_PREPARE)
      begin
        prepared_events = []
        failed_events = []
        raw_events.map do |event_json|
          event = Ingestion::ParsedEventFromIngestion.new(event_json)
          # technically one event can produce many more events (ie: stripe supplemental events)
          prepared_events_for_event = []
          if event.name == 'identify'
            parsed_event = Ingestion::EventPreparers::UserIdentifyHandler.new(event).handle_identify_and_return_updated_parsed_event!
            prepared_events_for_event << parsed_event.formatted_for_ingestion
          elsif event.name.starts_with?('stripe.')
            stripe_events = Ingestion::EventPreparers::StripeEventHandler.new(event).handle_and_return_parsed_events!
            prepared_events_for_event = stripe_events.map{ |parsed_event| parsed_event.formatted_for_ingestion }
          else
            parsed_event << Ingestion::EventPreparers::BasicEventHandler.new(event).handle_and_return_updated_parsed_event!
            prepared_events_for_event << parsed_event.formatted_for_ingestion
          end
          prepared_events.concat(prepared_events_for_event)
        rescue => e
          byebug
          failed_events << event_json
          Sentry.capture_message("Error preparing event into ingestion format during events ingestion, continuing with the rest of the events in the queue and pushing this one to the DLQ.\nevent: #{event_json}\n error: #{e.message}", level: 'error')
        end

        if prepared_events.any?
          Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.PREPARED_EVENTS, prepared_events)
          EventTriggers::Evaluator.evaluate_ingested_events(prepared_events)
        end
        if failed_events.any?
          Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS_TO_PREPARE_DLQ, failed_events)
        end
      rescue => e
        byebug
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS_TO_PREPARE_DLQ, raw_events)
        ingestion_batch.error_message = e.message
        Sentry.capture_exception(e)
      end
      ingestion_batch.num_records = raw_events.count
      ingestion_batch.completed_at = Time.current
      ingestion_batch.num_seconds_to_complete = ingestion_batch.completed_at - ingestion_batch.started_at
      ingestion_batch.save!
      ingestion_batch
    end

    private

    # def parse_events_from_queue_and_push_identify_events_into_queues!
    #   @prepared_events_to_ingest ||= begin
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