module IngestJobs
  class OrganizationIdentifies
    include Sidekiq::Job
    queue_as :ingestion

    def perform
      Ingestion::OrganizationIdentifiesIngestion.ingest!
    end
  end
end