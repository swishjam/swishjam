namespace :tasks do
  desc "Pulls the events, user_identify, and organization_identify events from the ingestion queue and process them"
  task sync_event_data_from_queue: [:environment] do
    ActiveRecord::Base.logger.silence do
      start = Time.current

      puts "Beginning to prepare events enqueued to be prepared...".colorize(:yellow)
      preparer_batch = Ingestion::EventsPreparer.prepare_events!
      puts "Completed events preparation.... #{preparer_batch.failed? ? "FAILED: #{preparer_batch.error_message}".colorize(:red) : "successful! #{preparer_batch.num_records} records prepared in #{preparer_batch.num_seconds_to_complete} seconds.".colorize(:green)}"


      puts "Starting to sync from all queues...".colorize(:yellow)
      batches = [
        Ingestion::ClickHouseWriters::PreparedEvents,
        Ingestion::ClickHouseWriters::ClickHouseUserProfiles,
        Ingestion::ClickHouseWriters::ClickHouseOrganizationProfiles,
        Ingestion::ClickHouseWriters::ClickHouseOrganizationMembers,
      ].map do |writer|
        writer.write_to_click_house!
      end

      batches.each do |batch|
        puts "#{batch.event_type} #{batch.failed? ? "FAILED: #{batch.error_message}".colorize(:red) : "successful! #{batch.num_records} records ingested.".colorize(:green)}"
      end

      puts "(Completed in #{Time.current - start} seconds.)".colorize(:grey)
    end
  end
end