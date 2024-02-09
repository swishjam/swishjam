namespace :data_migrations do
  namespace :temporary do
    task migrate_user_identifies_to_user_profile_devices: :environment do
      DataMigrators::UserIdentifiesToAnalyticsUserProfileDevices.run!
    end
  end
end