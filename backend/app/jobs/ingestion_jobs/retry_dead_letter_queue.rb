module IngestionJobs
  class RetryDeadLetterQueue
    include Sidekiq::Worker
    queue_as :default

    def perform(queue_name)
      case queue_name
      when Ingestion::QueueManager::Queues.EVENTS_TO_PREPARE_DLQ
        Ingestion::DeadLetterQueueRetriers::EventsToPrepareDlq.new(all_records: true).retry!
      else
        raise NotImplementedError, "Retry logic for #{queue_name} not implemented"
      end
    end
  end
end