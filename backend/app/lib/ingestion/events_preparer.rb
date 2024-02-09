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
        prepared_events_formatted_for_ingestion = []
        failed_events = []
        raw_events_to_prepare.each do |event_json|
          event = Ingestion::ParsedEventFromIngestion.new(event_json)
          if event.name == 'sdk_error'
            Sentry.capture_message("SDK Error: #{event.properties.dig('error', 'message')}", level: 'error')
            next
          end
          event_preparer_klass = event_preparer_klass_for_event(event.name)
          prepared_event = event_preparer_klass.new(event).handle_and_return_prepared_events!
          prepared_events = prepared_event.is_a?(Array) ? prepared_event : [prepared_event]
          prepared_events.each do |prepared_event|
            event_trigger_evaluator.enqueue_event_trigger_jobs_that_match_event(prepared_event)
          end
          prepared_events_formatted_for_ingestion += prepared_events.map(&:formatted_for_ingestion)
        rescue => e
          failed_events << event_json
          Sentry.capture_message("Error preparing event into ingestion format during events ingestion, continuing with the rest of the events in the queue and pushing this one to the DLQ.\nerror: #{e.message}\nevent: #{event_json}", level: 'error')
        end

        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.PREPARED_EVENTS, prepared_events_formatted_for_ingestion)
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS_TO_PREPARE_DLQ, failed_events)
        ingestion_batch.num_successful_records = prepared_events_formatted_for_ingestion.count
        ingestion_batch.num_failed_records = failed_events.count
      rescue => e
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS_TO_PREPARE_DLQ, raw_events_to_prepare)
        ingestion_batch.error_message = e.message
        ingestion_batch.num_failed_records = raw_events_to_prepare.count
        ingestion_batch.num_successful_records = 0
        Sentry.capture_exception(e)
      end
      ingestion_batch.num_records = raw_events_to_prepare.count
      ingestion_batch.completed_at = Time.current
      ingestion_batch.num_seconds_to_complete = ingestion_batch.completed_at - ingestion_batch.started_at
      ingestion_batch.save!
      ingestion_batch
    end

    private

    def event_preparer_klass_for_event(event_name)
      if event_name == 'identify'
        Ingestion::EventPreparers::UserIdentifyHandler
      elsif event_name.starts_with?('stripe.')
        Ingestion::EventPreparers::StripeEventHandler
      elsif event_name.starts_with?('resend.')
        Ingestion::EventPreparers::ResendEventHandler
      elsif event_name.starts_with?('intercom.')
        Ingestion::EventPreparers::IntercomEventHandler
      elsif event_name.starts_with?('github.')
        Ingestion::EventPreparers::GithubEventHandler
      elsif event_name.starts_with?('cal.')
        Ingestion::EventPreparers::CalComEventHandler
      else
        Ingestion::EventPreparers::BasicEventHandler
      end
    end
  end
end