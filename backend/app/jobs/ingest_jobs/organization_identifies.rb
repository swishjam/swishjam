module IngestJobs
  class OrganizationIdentifies
    include Sidekiq::Job
    queue_as :default

    def perform
      Ingestion::OrganizationProfilesIngestion.ingest!
    end
  end
end