module IngestJobs
  class OrganizationIdentifies
    include Sidekiq::Job
    queue_as :default

    def perform
      Ingestion::OrganizationIdentifiesIngestion.ingest!
    end
  end
end