require 'colorize'
prompter = TTY::Prompt.new

namespace :data do
  desc "Pulls the events, user_identify, and organization_identify events from the ingestion queue and process them"
  task enqueue_user_profiles_into_clickhouse_replication_ingestion: [:environment] do
    scope = prompter.select("Define the scope of the user sync:", ['everything', 'user']){ |q| q.default 'everything' }
    if scope == 'user'
      user_id = prompter.ask('Enter the user ID:')
      user_profile = AnalyticsUserProfile.find(user_id)
      user_profile.enqueue_into_clickhouse_replication_data
      puts "Successfully enqueue user profile #{user_profile.id} (#{user_profile.email}) into ClickHouse replication ingestion queue".colorize(:green)
    else
      profiles = AnalyticsUserProfile.all
      progress_bar = TTY::ProgressBar.new("Enqueing #{profiles.count} user profiles [:bar]", total: profiles.count, bar_format: :block)
      ActiveRecord::Base.logger.silence do
        profiles.each do |user_profile|
          begin
            user_profile.enqueue_into_clickhouse_replication_data
          rescue => e
            puts "Failed to enqueue user profile #{user_profile.id} (#{user_profile.email}) into ClickHouse replication ingestion queue: #{e.message}".colorize(:red)
          end
          progress_bar.advance
        end
      end
    end
  end
end