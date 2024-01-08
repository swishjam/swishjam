namespace :tasks do
  desc "Pulls the events, user_identify, and organization_identify events from the ingestion queue and process them"
  task sync_event_data_from_queue: [:environment] do
    ActiveRecord::Base.logger.silence do
      start = Time.current

      puts "Syncing events...".colorize(:green)
      event_batch = Ingestion::EventsIngestion.ingest!
      puts "Syncing user identify events...".colorize(:green)
      user_identify_batch = Ingestion::UserIdentifiesIngestion.ingest!
      puts "Syncing organization identify events...".colorize(:green)
      organization_identify_batch = Ingestion::OrganizationProfilesIngestion.ingest!

      puts "Syncing user profile clickhouse replication...".colorize(:green)
      user_replication_batch = Ingestion::UserProfileClickHouseReplicationIngestion.ingest!

      puts "Syncing organization profile clickhouse replication...".colorize(:green)
      organization_replication_batch = Ingestion::OrganizationProfileClickHouseReplicationIngestion.ingest!

      puts "Syncing user profiles from events...".colorize(:green)
      user_profiles_from_events_batch = Ingestion::UserProfilesFromEventIngestion.ingest!
      
      puts "\nEvents ingestion #{event_batch.failed? ? "FAILED" : "successful! #{event_batch.num_records} events ingested."}".colorize(event_batch.failed? ? :red : :green)
      puts "User identify events ingestion #{user_identify_batch.failed? ? "FAILED" : "successful! #{user_identify_batch.num_records} events ingested."}".colorize(user_identify_batch.failed? ? :red : :green)
      puts "Organization profile ingestion #{organization_identify_batch.failed? ? "FAILED" : "successful! #{organization_identify_batch.num_records} events ingested."}".colorize(organization_identify_batch.failed? ? :red : :green)
      puts "User profile clickhouse replication ingestion #{user_replication_batch.failed? ? "FAILED" : "successful! #{user_replication_batch.num_records} events ingested."}".colorize(user_replication_batch.failed? ? :red : :green)
      puts "Organization profile clickhouse replication ingestion #{organization_replication_batch.failed? ? "FAILED" : "successful! #{organization_replication_batch.num_records} events ingested."}".colorize(organization_replication_batch.failed? ? :red : :green)
      puts "User profiles from events ingestion #{user_profiles_from_events_batch.failed? ? "FAILED" : "successful! #{user_profiles_from_events_batch.num_records} events ingested."}".colorize(user_profiles_from_events_batch.failed? ? :red : :green)

      puts "(Performed in #{Time.current - start} seconds.)".colorize(:grey)
    end
  end
end