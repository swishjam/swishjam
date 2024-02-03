namespace :data_migrations do
  namespace :temporary do
    task new_ingestion_data_migration: :environment do
      start = Time.current
      [
        DataMigrators::MoveUserColumnsToMetadataAndEnqueueAllProfilesToBeReplicatedIntoClickhouse,
        DataMigrators::MigrateOldOrganizationProfilesIntoNewTable,
        DataMigrators::MoveOldEventsDataIntoEventsTableWithNewFields,
        DataMigrators::UserIdentifiesToAnalyticsUserProfileDevices,
      ].each do |migrator|
        puts "Beginning #{migrator.to_s} migration...".colorize(:yellow)
        migrator.run!
        puts "Finished #{migrator.to_s} migration.\n".colorize(:green)
      end
      puts "All migrations completed in #{Time.current - start} seconds!".colorize(:green)
    end
  end
end