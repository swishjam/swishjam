require 'colorize'
require "tty-prompt"
require 'tty-progressbar'

namespace :data_migrations do
  task fix_missing_created_at_timestamp_in_clickhouse_user_profiles: [:environment] do
    ActiveRecord::Base.logger.silence do
      profile_ids_with_missing_timestamp = Analytics::SwishjamUserProfile.execute_sql("SELECT swishjam_user_id FROM swishjam_user_profiles WHERE created_at <= toDateTime('1970-02-01 00:00:00')")
      puts "Attempting to fix #{profile_ids_with_missing_timestamp.count} Swishjam User Profiles with missing timestamps...".colorize(:grey)
      
      if profile_ids_with_missing_timestamp.count.zero?
        puts "No Swishjam User Profiles with missing timestamps found!".colorize(:green)
      else
        new_profile_data = profile_ids_with_missing_timestamp.map do |profile|
          profile_id = profile['swishjam_user_id']
          supabase_profile = AnalyticsUserProfile.find(profile_id)
          public_key = supabase_profile.workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key
          { 
            swishjam_api_key: public_key, 
            unique_identifier: supabase_profile.user_unique_identifier,
            swishjam_user_id: profile_id,
            created_at: supabase_profile.created_at,
          }
        end
        Analytics::SwishjamUserProfile.insert_all(new_profile_data)
        puts "Inserted #{new_profile_data.count} new Swishjam User Profiles into ClickHouse".colorize(:green)
  
        Analytics::ClickHouseRecord.execute_sql("DELETE FROM swishjam_user_profiles WHERE created_at <= toDateTime('1970-02-01 00:00:00')", format: nil)
        puts "Deleted #{profile_ids_with_missing_timestamp.count} Swishjam User Profiles from ClickHouse".colorize(:green)
  
        Analytics::ClickHouseRecord.execute_sql("OPTIMIZE TABLE swishjam_user_profiles", format: nil)
        puts "Are there any Swishjam User Profiles with missing timestamps?"
        all_gone = Analytics::SwishjamUserProfile.where(created_at: nil).count.zero?
        puts all_gone ? "Nope, all gone!".colorize(:green) : "Yup, still some left...".colorize(:red)
      end
      
    end
  end
end