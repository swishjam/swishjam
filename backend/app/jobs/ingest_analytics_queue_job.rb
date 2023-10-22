class IngestAnalyticsQueueJob
  include Sidekiq::Job
  queue_as :ingestion

  def perform
    Ingestion::EventsIngestion.new.ingest!
  end
end