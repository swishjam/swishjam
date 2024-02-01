namespace :data_migrations do
  namespace :temporary do
    task move_old_events_data_into_events_table_with_new_fields: :environment do
      DataMigrators::MoveOldEventsDataIntoEventsTableWithNewFields.run!
    end
  end
end