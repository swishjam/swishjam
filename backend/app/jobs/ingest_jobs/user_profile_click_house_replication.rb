module IngestJobs
  class UserIdentifies
    include Sidekiq::Job
    queue_as :default

    def perform
      Ingestion::UserProfileClickHouseReplicationIngestion.ingest!
    end
  end
end