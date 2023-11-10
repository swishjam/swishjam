module IngestJobs
  class Events
    include Sidekiq::Job
    queue_as :default

    def perform
      Ingestion::EventsIngestion.ingest!
    end
  end
end