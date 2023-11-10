module IngestJobs
  class Events
    include Sidekiq::Job
    queue_as :ingestion

    def perform
      Ingestion::EventsIngestion.ingest!
    end
  end
end