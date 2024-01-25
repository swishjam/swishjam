module Ingestion
  class PrepareEventsAndEnqueueIntoClickHouseWriterJob
    include Sidekiq::Worker
    queue_as :format_events_queue

    def perform(raw_events)
      raw_events = raw_events.is_a?(Array) ? raw_events : [raw_events]
      Ingestion::EventsPreparer.new(raw_events).prepare_events!
    end
  end
end