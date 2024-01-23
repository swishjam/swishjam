class WriteToClickHouseFromIngestionQueuesJob
  include Sidekiq::Job
  # TODO: we need a separate queue/process for the ClickHouse ingestion work
  queue_as :default

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