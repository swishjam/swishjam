namespace :data_migrations do
  namespace :temporary do
    task move_user_columns_to_metadata_and_enqueue_all_profiles_into_clickhouse: :environment do
      DataMigrators::MoveUserColumnsToMetadataAndEnqueueAllProfilesToBeReplicatedIntoClickhouse.run!
    end
  end
end