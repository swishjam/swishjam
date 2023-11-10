module IngestJobs
  class UserIdentifies
    include Sidekiq::Job
    queue_as :ingestion

    def perform
      Ingestion::UserIdentifiesIngestion.ingest!
    end
  end
end