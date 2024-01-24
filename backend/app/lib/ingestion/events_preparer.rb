module Ingestion
  class EventsPreparer
    attr_accessor :ingestion_batch, :raw_events_to_prepare, :event_trigger_evaluator
    EVENT_NAMES_TO_IGNORE = %w[sdk_error].freeze
    
    def self.format_for_events_to_prepare_queue(uuid:, swishjam_api_key:, name:, occurred_at:, properties:)
      {
        uuid: uuid,
        swishjam_api_key: swishjam_api_key,
        name: name,
        occurred_at: occurred_at,
        properties: properties,
      }
    end

    def initialize(raw_events_to_prepare)
      @ingestion_batch = IngestionBatch.create!(started_at: Time.current, event_type: 'event_preparer')
      @raw_events_to_prepare = raw_events_to_prepare
      @event_trigger_evaluator = EventTriggers::Evaluator.new
    end

    def prepare_events!
      begin
        prepared_events = []
        failed_events = []
        raw_events_to_prepare.each do |event_json|
          event = Ingestion::ParsedEventFromIngestion.new(event_json)
          # technically one event can produce many more events (ie: stripe supplemental events)
          prepared_events_for_event = []
          if event.name == 'identify'
            prepared_events_for_event << prepare_identify_event_and_return_ingestion_json(event)
          elsif event.name.starts_with?('stripe.')
            prepared_events_for_event = prepare_stripe_event_and_return_ingestion_jsons(event) 
          elsif event.name.starts_with?('resend.')
            prepared_events_for_event << prepare_resend_event_and_return_ingestion_json(event)
          elsif event.name === 'sdk_error'
            Sentry.capture_message("SDK Error: #{event.properties.dig('error', 'message')}", level: 'error')
          else
            prepared_events_for_event << prepare_basic_event_and_return_ingestion_json(event)
          end
          prepared_events.concat(prepared_events_for_event)
        rescue => e
          byebug
          failed_events << event_json
          Sentry.capture_message("Error preparing event into ingestion format during events ingestion, continuing with the rest of the events in the queue and pushing this one to the DLQ.\nevent: #{event_json}\n error: #{e.message}", level: 'error')
        end

        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.PREPARED_EVENTS, prepared_events)
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS_TO_PREPARE_DLQ, failed_events)
      rescue => e
        byebug
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS_TO_PREPARE_DLQ, raw_events_to_prepare)
        ingestion_batch.error_message = e.message
        Sentry.capture_exception(e)
      end
      ingestion_batch.num_records = raw_events_to_prepare.count
      ingestion_batch.num_successful_records = prepared_events.count
      ingestion_batch.num_failed_records = failed_events.count
      ingestion_batch.completed_at = Time.current
      ingestion_batch.num_seconds_to_complete = ingestion_batch.completed_at - ingestion_batch.started_at
      ingestion_batch.save!
      ingestion_batch
    end

    private

    def prepare_identify_event_and_return_ingestion_json(parsed_event)
      prepared_event = Ingestion::EventPreparers::UserIdentifyHandler.new(parsed_event).handle_identify_and_return_prepared_event!
      event_trigger_evaluator.enqueue_event_trigger_jobs_that_match_event(prepared_event)
      prepared_event.formatted_for_ingestion
    end

    def prepare_basic_event_and_return_ingestion_json(parsed_event)
      prepared_event = Ingestion::EventPreparers::BasicEventHandler.new(parsed_event).handle_and_return_prepared_event!
      event_trigger_evaluator.enqueue_event_trigger_jobs_that_match_event(prepared_event)
      prepared_event.formatted_for_ingestion
    end

    def prepare_stripe_event_and_return_ingestion_jsons(parsed_event)
      stripe_events = Ingestion::EventPreparers::StripeEventHandler.new(parsed_event).handle_and_return_prepared_events!
      stripe_events.each do |prepared_event|
        event_trigger_evaluator.enqueue_event_trigger_jobs_that_match_event(prepared_event)
      end
      stripe_events.map{ |prepared_event| prepared_event.formatted_for_ingestion }
    end

    def prepare_resend_event_and_return_ingestion_json(parsed_event)
      prepared_event = Ingestion::EventPreparers::ResendEventHandler.new(parsed_event).handle_and_return_prepared_event!
      event_trigger_evaluator.enqueue_event_trigger_jobs_that_match_event(prepared_event)
      prepared_event.formatted_for_ingestion
    end
  end
end