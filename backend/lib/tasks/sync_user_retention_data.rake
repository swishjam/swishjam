require "tty-prompt"
require 'tty-progressbar'

namespace :tasks do
  desc "Enqueues the UserRetentionSyncJob to sync all user retention data for all workspaces"
  task sync_user_retention_data: [:environment] do
    # duplicated from UserRetentionSyncJob so we can access the data_syncs
    ActiveRecord::Base.logger.silence do
      progress_bar = TTY::ProgressBar.new("Syncing user retention data for all workspaces [:bar]", total: Workspace.count, bar_format: :block)
      syncs = Workspace.all.map do |workspace|
        data_sync = DataSync.create(workspace: workspace, provider: 'swishjam_user_retention', started_at: Time.current)
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
      if syncs.any?(&:error_message)
        puts "Some data syncs failed:".colorize(:red)
        syncs.select(&:error_message).each do |data_sync|
          puts "  #{data_sync.workspace.name}: #{data_sync.error_message}".colorize(:red)
        end
      else
        puts "All data syncs succeeded".colorize(:green)
      end
    end
  end
end