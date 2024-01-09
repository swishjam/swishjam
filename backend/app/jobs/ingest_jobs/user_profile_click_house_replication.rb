module IngestJobs
  class UserProfileClickHouseReplication
    include Sidekiq::Job
    queue_as :default

    def perform
      Ingestion::UserProfileClickHouseReplicationIngestion.ingest!
    end
  end
end