require "tty-prompt"
require 'tty-progressbar'

namespace :tasks do
  desc "Enqueues the UserRetentionSyncJob to sync all user retention data for all workspaces"
  task sync_user_retention_data: [:environment] do
    # duplicated from UserRetentionSyncJob so we can access the data_syncs
    ActiveRecord::Base.logger.silence do
      all_workspaces = Workspace.all
      progress_bar = TTY::ProgressBar.new("Syncing user retention data for all #{all_workspaces.count} workspaces [:bar]", total: all_workspaces.count, bar_format: :block)
      syncs = all_workspaces.map do |workspace|
        data_sync = DataSync.create!(workspace: workspace, provider: 'swishjam_user_retention', started_at: Time.current)
        begin
          DataSynchronizers::UserRetention.new(workspace, oldest_cohort_date: 12.months.ago, oldest_activity_week: 8.weeks.ago).sync_workspaces_retention_cohort_data!
          puts "Synced workspace #{workspace.name} (#{workspace.id}) user retention data (data sync: #{data_sync.id})".colorize(:green)
          data_sync.completed!
        rescue => e
          puts "Failed to sync workspace #{workspace.name} (#{workspace.id}) user retention data (data sync: #{data_sync.id}): #{e.inspect}".colorize(:red)
          data_sync.failed!(e.message)
        end
        progress_bar.advance
        data_sync
      end

      puts "\nRan #{syncs.count} data syncs".colorize(:grey)
      syncs.each do |sync|
        if sync.failed?
          puts "Data sync failed for workspace #{sync.workspace.name} (#{sync.workspace.id}): #{sync.error_message}".colorize(:red)
        else
          puts "Data sync succeeded for workspace #{sync.workspace.name} (#{sync.workspace.id})".colorize(:green)
        end
      end
    end
  end
end