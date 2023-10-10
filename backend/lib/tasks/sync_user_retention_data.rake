namespace :tasks do
  desc "Enqueues the UserRetentionSyncJob to sync all user retention data for all workspaces"
  task sync_user_retention_data: [:environment] do
    UserRetentionSyncJob.perform_async
    puts "Enqueued UserRetentionSyncJob!".colorize(:green)
  end
end