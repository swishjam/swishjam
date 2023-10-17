require 'colorize'
require "tty-prompt"
require 'tty-progressbar'

namespace :data_migrations do
  desc "Copies all user profiles in Supabase into Clickhouse where they do not yet exist"
  task migrate_user_profiles_into_clickhouse: [:environment] do
    ActiveRecord::Base.logger.silence do
      profiles = AnalyticsUserProfile.all
      progress_bar = TTY::ProgressBar.new("Checking to insert #{profiles.count} into ClickHouse [:bar]", total: profiles.count, bar_format: :block)

      profiles.each_with_index do |profile, i|
        if Analytics::SwishjamUserProfile.where(swishjam_user_id: profile.id).any?
          puts "Skipping #{profile.email || profile.id}, already exists in ClickHouse.".colorize(:green)
        else
          puts "Inserting #{profile.email || profile.id} into Clickhouse....".colorize(:yellow)
          Analytics::SwishjamUserProfile.create!(
            swishjam_api_key: profile.workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key,
            swishjam_user_id: profile.id,
            unique_identifier: profile.user_unique_identifier,
            created_at: profile.created_at,
          )
          puts "Done".colorize(:green)
        end
        progress_bar.advance
      end
    end
  end
end