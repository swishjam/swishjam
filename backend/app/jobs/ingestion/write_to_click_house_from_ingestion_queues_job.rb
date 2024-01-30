module Ingestion
  class WriteToClickHouseFromIngestionQueuesJob
    include Sidekiq::Job
    queue_as :click_house_writer_queue

    def perform
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