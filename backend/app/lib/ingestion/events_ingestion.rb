class Ingestion
  class EventsIngestion
    attr_accessor :ingestion_record
    
    def initialize
      ingestion_record = Ingestion.new(started_at: Time.current)
    end

    def ingest!
      formatted_events = parse_events_from_queue_and_push_identify_events_into_queues!
      ingestion_record.num_records = formatted_events.count
      Analytics::Event.insert_all!(formatted_events)
      ingestion_record.completed_at = Time.current
      ingestion_record.num_seconds_to_complete = ingestion_record.completed_at - ingestion_record.started_at
      ingestion_record.save!
    rescue => e
      Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, events)
      ingestion_record.completed_at = Time.current
      ingestion_record.num_seconds_to_complete = ingestion_record.completed_at - ingestion_record.started_at
      ingestion_record.error_message = e.message
      ingestion_record.save!
      
      Rails.logger.error "Failed to ingest from analytics queue: #{e.inspect}"
      Sentry.capture_exception(e)
    end

    private

    def parse_events_from_queue_and_push_identify_events_into_queues!
      @formatted_events_to_ingest ||= begin
        identify_events = []
        organization_events = []
        raw_events = Ingestion::QueueManager.pop_all_records_from_queue(Ingestion::QueueManager::Queues.EVENTS)
        formatted_events = raw_events.map do |stringified_event| 
          json_event = JSON.parse(stringified_event)
          if json_event['event'] == 'identify'
            identify_events << stringified_event
          elsif json_event['event'] == 'organization'
            organization_events << stringified_event
          end
          json_event
        end
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.IDENTIFY, identify_events) if identify_events.count > 0
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.ORGANIZATION, organization_events) if organization_events.count > 0
        formatted_events
      end
    end

  end
end