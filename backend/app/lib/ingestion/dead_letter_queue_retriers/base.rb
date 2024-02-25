module Ingestion
  module DeadLetterQueueRetriers
    class Base
      class << self
        attr_accessor :queue_name
      end

      attr_reader :json_records, :retry_all_records, :ingestion_batch

      def initialize(record: nil, records: nil, all_records: nil, ingestion_batch: nil)
        if [record, records, all_records].compact.count != 1
          raise ArgumentError, "Must provide exactly one of `record`, `records`, or `all_records`"
        end
        if !self.class.queue_name
          raise NotImplementedError, "Subclass #{self.class} must implement `queue_name` method."
        end
        @json_records = records || [record]
        @retry_all_records = all_records || false
        @ingestion_batch = ingestion_batch || IngestionBatch.start!("#{self.class.queue_name}_retry")
      end

      def retry!
        records_to_retry = json_records
        if retry_all_records
          records_to_retry = Ingestion::QueueManager.pop_all_records_from_queue(self.class.queue_name)
        else
          records_to_retry.each{ |json_record| Ingestion::QueueManager.remove_record_from_queue(self.class.queue_name, json_record) }
        end
        ingestion_batch.num_records = records_to_retry.count
        records_to_retry = records_to_retry.map do |json| 
          Ingestion::EventsPreparer.format_for_events_to_prepare_queue(
            uuid: json['uuid'],
            swishjam_api_key: json['swishjam_api_key'],
            name: json['name'],
            occurred_at: json['occurred_at'],
            properties: json['properties'],
          )
        end
        retry_records!(records_to_retry)
        ingestion_batch.complete!
      end

      def retry_records!(records)
        raise NotImplementedError, "Subclass #{self.class} must implement `retry_record!` method."
      end
    end
  end
end