module IngestJobs
  class UserProfilesFromEvents
    include Sidekiq::Job
    queue_as :default

    def perform
      Ingestion::UserProfilesFromEventsIngestion.ingest!
    end
  end
end