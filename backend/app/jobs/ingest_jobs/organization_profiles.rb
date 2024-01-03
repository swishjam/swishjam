module IngestJobs
  class OrganizationProfiles
    include Sidekiq::Job
    queue_as :default

    def perform
      Ingestion::OrganizationProfilesIngestion.ingest!
    end
  end
end