module IngestionJobs
  class WriteToClickHouseFromIngestionQueues
    include Sidekiq::Job
    queue_as :click_house_writer_queue

    def perform
      if ENV['DISABLE_CLICK_HOUSE_WRITERS']
        Sentry.capture_message('ClickHouse writer job is disabled (`DISABLE_CLICK_HOUSE_WRITERS` ENV), skipping `IngestionJobs::WriteToClickHouseFromIngestionQueues`.')
        return
      end
      [
        Ingestion::ClickHouseWriters::PreparedEvents,
        Ingestion::ClickHouseWriters::ClickHouseUserProfiles,
        Ingestion::ClickHouseWriters::ClickHouseOrganizationProfiles,
        Ingestion::ClickHouseWriters::ClickHouseOrganizationMembers,
      ].map do |writer|
        writer.write_to_click_house!
      end
    end
  end
end