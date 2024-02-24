module Ingestion
  module DeadLetterQueueRetriers
    class EventsToPrepareDlq < Base
      self.queue_name = Ingestion::QueueManager::Queues.EVENTS_TO_PREPARE_DLQ

      def retry_records!(json_records)
        ingestion_batch = IngestionBatch.create!(
          started_at: Time.current, 
          event_type: 'dlq_retry_event_preparer', 
          num_records: json_records.count,
          num_successful_records: 0,
          num_failed_records: 0,
        )
        Ingestion::EventsPreparer.new(json_records, ingestion_batch: ingestion_batch).prepare_events!
        ingestion_batch.completed_at = Time.current
        ingestion_batch.num_seconds_to_complete = ingestion_batch.completed_at - ingestion_batch.started_at
        ingestion_batch.save!
        ingestion_batch
      end
    end
  end
end