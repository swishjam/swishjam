module IngestJobs
  class UserIdentifies
    include Sidekiq::Job
    queue_as :default

    def perform
      Ingestion::UserIdentifiesIngestion.ingest!
    end
  end
end