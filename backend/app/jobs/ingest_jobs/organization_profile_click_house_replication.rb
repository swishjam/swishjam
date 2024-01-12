module IngestJobs
  class OrganizationProfileClickHouseReplication
    include Sidekiq::Job
    queue_as :default

    def perform
      Ingestion::OrganizationProfileClickHouseReplicationIngestion.ingest!
    end
  end
end