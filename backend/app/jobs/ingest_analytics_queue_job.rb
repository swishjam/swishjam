class IngestAnalyticsQueueJob
  include Sidekiq::Job
  queue_as :ingestion

  def perform
    ingestion = Ingestion.new(started_at: Time.current)
    events = Ingestion::QueueManager.pop_all_records_from_queue(Ingestion::QueueManager::Queues.EVENTS)
    ingestion.num_records = events.count
    begin
      identify_events = []
      organization_events = []
      formatted_events = events.map do |e| 
        json_event = JSON.parse(e)
        if json_event['event'] == 'identify'
          identify_events << e
        elsif json_event['event'] == 'organization'
          organization_events << e
        end
        json_event
      end
      Analytics::Event.insert_all!(formatted_events)
      if identify_events.count > 0
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.IDENTIFY, identify_events)
      end
      if organization_events.count > 0
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.ORGANIZATION, organization_events)
      end
      ingestion.completed_at = Time.current
      ingestion.num_seconds_to_complete = ingestion.completed_at - ingestion.started_at
      ingestion.save!
    rescue => e
      Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, events)
      ingestion.completed_at = Time.current
      ingestion.num_seconds_to_complete = ingestion.completed_at - ingestion.started_at
      ingestion.error_message = e.message
      ingestion.save!
      
      Rails.logger.error "Failed to ingest from analytics queue: #{e.inspect}"
      Sentry.capture_exception(e)
    end
  end
end