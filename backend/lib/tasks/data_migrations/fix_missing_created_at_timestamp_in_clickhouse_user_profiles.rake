require 'colorize'
require "tty-prompt"
require 'tty-progressbar'

namespace :data_migrations do
  task fix_missing_created_at_timestamp_in_clickhouse_user_profiles: [:environment] do
    ActiveRecord::Base.logger.silence do
      profiles_with_missing_timestamp = Analytics::SwishjamUserProfile.where(created_at: nil)
      progress_bar = TTY::ProgressBar.new("Checking to insert #{profiles_with_missing_timestamp.count} into ClickHouse [:bar]", total: profiles_with_missing_timestamp.count, bar_format: :block)

      profiles_with_missing_timestamp.each_with_index do |profile, i|
        puts "Updating #{profile.swishjam_user_id}....".colorize(:yellow)
        supabase_profile = AnalyticsUserProfile.find(profile.swishjam_user_id)
        Analytics::ClickHouseRecord.execute_sql("ALTER TABLE analytics.swishjam_user_profiles UPDATE created_at = toDateTime('#{supabase_profile.created_at}') WHERE swishjam_user_id = #{profile.swishjam_user_id}")
        puts "Done".colorize(:green)
        progress_bar.advance
      end
    end
  end
end