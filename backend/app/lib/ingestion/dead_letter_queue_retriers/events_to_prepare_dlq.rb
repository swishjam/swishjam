module Ingestion
  module DeadLetterQueueRetriers
    class EventsToPrepareDlq < Base
      self.queue_name = Ingestion::QueueManager::Queues.EVENTS_TO_PREPARE_DLQ

      def retry_records!(json_records)
        Ingestion::EventsPreparer.new(json_records, ingestion_batch: ingestion_batch).prepare_events!
      end
    end
  end
end