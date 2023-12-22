module Ingestion
  class EventsIngestion
    attr_accessor :ingestion_batch

    EVENT_NAMES_TO_IGNORE = %w[sdk_error].freeze
    
    def initialize
      @ingestion_batch = IngestionBatch.new(started_at: Time.current, event_type: 'events')
    end

    def self.ingest!
      if ENV['HAULT_ALL_INGESTION_JOBS'] || ENV['HAULT_EVENTS_INGESTION']
        Sentry.capture_message("Haulting `EventsIngestion`` early because either `HAULT_ALL_INGESTION_JOBS` or `HAULT_EVENTS_INGESTION` ENV is set to true. Ingestion will pick back up when these ENVs are unset.")
        return
      end
      new.ingest!
    end

    def ingest!
      formatted_events = parse_events_from_queue_and_push_identify_events_into_queues!
      begin
        Analytics::Event.insert_all!(formatted_events) if formatted_events.any?
        
        @ingestion_batch.num_records = formatted_events.count
        @ingestion_batch.completed_at = Time.current
        @ingestion_batch.num_seconds_to_complete = @ingestion_batch.completed_at - @ingestion_batch.started_at
        @ingestion_batch.save!
      rescue => e
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS_DEAD_LETTER_QUEUE, formatted_events)
        
        @ingestion_batch.completed_at = Time.current
        @ingestion_batch.num_seconds_to_complete = @ingestion_batch.completed_at - @ingestion_batch.started_at
        @ingestion_batch.error_message = e.message
        @ingestion_batch.save!

        Rails.logger.error "Failed to ingest from analytics queue: #{e.inspect}"
        Sentry.capture_exception(e)
      end

      EventTriggers::Evaluator.evaluate_ingested_events(formatted_events)
      @ingestion_batch
    end

    private

    def parse_events_from_queue_and_push_identify_events_into_queues!
      @formatted_events_to_ingest ||= begin
        identify_events = []
        organization_events = []
        events = Ingestion::QueueManager.pop_all_records_from_queue(Ingestion::QueueManager::Queues.EVENTS)
        formatted_events = events.each do |e|
          case e['name']
          when 'identify'
            identify_events << e
          when 'organization'
            organization_events << e
          when 'sdk_error'
            begin
              Sentry.capture_message("SDK Error: #{JSON.parse(e['properties'] || '{}').dig('error', 'message')}", level: 'error')
            rescue => e
              Sentry.capture_exception(e)
            end
          end
        end
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.IDENTIFY, identify_events) if identify_events.count > 0
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.ORGANIZATION, organization_events) if organization_events.count > 0
        filtered_events = events.reject { |e| EVENT_NAMES_TO_IGNORE.include?(e['name']) }
        filtered_events
      end
    end
  end
end