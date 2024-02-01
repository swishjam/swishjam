namespace :data_migrations do
  namespace :temporary do
    task migrate_click_house_identifies_to_postgres_devices: :environment do
      DataMigrators::UserIdentifiesToAnalyticsUserProfileDevices.run!
    end
  end
end