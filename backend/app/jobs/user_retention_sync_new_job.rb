class UserRetentionSyncNewJob
  include Sidekiq::Job
  queue_as :default

  def perform
    Workspace.all.each do |workspace|
      data_sync = DataSync.create(workspace: workspace, provider: 'swishjam_user_retention', started_at: Time.current)
      begin
        DataSynchronizers::UserRetention.new(workspace).sync_workspaces_retention_cohort_data!
        data_sync.completed!
      rescue => e
        Rails.logger.error "Failed to sync workspace #{workspace.name} (#{workspace.id}) user retention data (data sync: #{data_sync.id}): #{e.inspect}"
        data_sync.failed!(e.message)
      end
    end
  end
end