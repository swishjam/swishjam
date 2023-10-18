namespace :tasks do
  desc "Enqueues the UserRetentionSyncJob to sync all user retention data for all workspaces"
  task sync_user_retention_data: [:environment] do
    prompter = TTY::Prompt.new
    
    oldest_cohort_selected = prompter.select('What is the oldest cohort we should update/create?', ['1 week old', '1 month old', '3 months old', '6 months old', '12 months old', '18 months old']){ |q| q.default '1 month old' }
    oldest_cohort_date = {
      '1 week old' => 1.week.ago,
      '1 month old' => 1.month.ago,
      '3 months old' => 3.months.ago,
      '6 months old' => 6.months.ago,
      '12 months old' => 12.months.ago,
      '18 months old' => 18.months.ago,
    }[oldest_cohort_selected]
    
    oldest_activity_period_selected = prompter.select('How far back should we update/create activity periods for each cohort??', ['1 week', '1 month', '3 months', '6 months', '12 months', '18 months']){ |q| q.default '1 month' }
    oldest_activity_period = {
      '1 week' => 1.week.ago,
      '1 month' => 1.month.ago,
      '3 months' => 3.months.ago,
      '6 months' => 6.months.ago,
      '12 months' => 12.months.ago,
      '18 months' => 18.months.ago,
    }[oldest_activity_period_selected]

    ActiveRecord::Base.logger.silence do
      start_time = Time.now
      workspaces = Workspace.all
      progress_bar = TTY::ProgressBar.new("Syncing #{workspaces.count} workspaces\' user retention data [:bar]", total: workspaces.count, bar_format: :block)
      workspaces.each do |workspace|
        puts "Synchornizing #{workspace.name} user retention data...".colorize(:yellow)
        DataSynchronizers::UserRetention.new(workspace, oldest_cohort_date: oldest_cohort_date, oldest_activity_week: oldest_activity_period).sync_workspaces_retention_cohort_data!
        progress_bar.advance
        puts "\n"
      end
      puts "Synced #{workspaces.count} workspace in #{Time.now - start_time} seconds.".colorize(:green)
    end
  end
end