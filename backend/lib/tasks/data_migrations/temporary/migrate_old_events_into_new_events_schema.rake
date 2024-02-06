namespace :data_migrations do
  namespace :temporary do
    task migrate_old_events_into_new_events_schema: :environment do
      DataMigrators::MoveOldEventsDataIntoEventsTableWithNewFields.run!
    end
  end
end