class IngestAnalyticsQueueJob
  include Sidekiq::Job
  queue_as :ingestion

  def perform
    ingestion = Ingestion.new(started_at: Time.current)
    events = Ingestion::QueueManager.pop_all_records_from_queue(Ingestion::QueueManager::Queues.EVENTS)
    ingestion.num_records = events.count
    begin
      formatted_events = events.map{ |e| JSON.parse(e) }
      Analytics::Event.insert_all!(events)
      # TODO: need to push identify and organization events into a new queue to be processed later.
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