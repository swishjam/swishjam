module Ingestion
  module ClickHouseWriters
    class Base
      attr_accessor :ingestion_batch

      class << self
        attr_accessor :analytics_model
      end

      def initialize
        @ingestion_batch = IngestionBatch.new(started_at: Time.current, event_type: "click_house_writer_#{self.class.QUEUE_NAME.downcase}")
      end

      def self.write_to_click_house!
        if ENV['HAULT_ALL_INGESTION_JOBS'] || ENV["HAULT_#{self.QUEUE_NAME}_INGESTION"]
          Sentry.capture_message("Haulting `#{self.to_s}` early because either `HAULT_ALL_INGESTION_JOBS` or `HAULT_#{self.QUEUE_NAME}_INGESTION` ENV is set to true. Ingestion will pick back up when these ENVs are unset.")
          return
        end
        new.write_to_click_house!
      end

      def self.QUEUE_NAME
        self.to_s.split('::').last.underscore.upcase
      end

      def write_to_click_house!
        formatted_records = Ingestion::QueueManager.pop_all_records_from_queue(Ingestion::QueueManager::Queues.send(self.class.QUEUE_NAME))
        begin
          self.class.analytics_model.insert_all!(formatted_records) if formatted_records.any?
          ingestion_batch.num_successful_records = formatted_records.count
          ingestion_batch.num_failed_records = 0
        rescue => e
          byebug
          Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.send("#{self.class.QUEUE_NAME}_DLQ"), formatted_records)
          ingestion_batch.error_message = e.message
          ingestion_batch.num_failed_records = formatted_records.count
          Sentry.capture_exception(e)
        end
        ingestion_batch.num_records = formatted_records.count
        ingestion_batch.completed_at = Time.current
        ingestion_batch.num_seconds_to_complete = ingestion_batch.completed_at - ingestion_batch.started_at
        ingestion_batch.save!

        ingestion_batch
      end
    end
  end
end