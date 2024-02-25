module IngestionJobs
  class RetryDeadLetterQueue
    include Sidekiq::Worker
    queue_as :default

    def perform(queue_name, ingestion_batch_id = nil)
      ingestion_batch = ingestion_batch_id ? IngestionBatch.find(ingestion_batch_id) : nil
      case queue_name
      when Ingestion::QueueManager::Queues.EVENTS_TO_PREPARE_DLQ
        Ingestion::DeadLetterQueueRetriers::EventsToPrepareDlq.new(all_records: true, ingestion_batch: ingestion_batch).retry!
      else
        raise NotImplementedError, "Retry logic for #{queue_name} not implemented"
      end
    end
  end
end