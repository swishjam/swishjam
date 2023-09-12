require "tty-prompt"
PROMPT = TTY::Prompt.new

namespace :purge do
  desc "Purges all dummy data from databases"
  task dummy_data: [:environment] do
    raise "You are not allowed to run this task in production!!!" unless Rails.env.development? || Rails.env.test?
    
    workspaces = Workspace.all.order(name: :asc)
    raise "No workspaces to purge!" if workspaces.empty?
    options = {}
    workspaces.each_with_index{ |workspace| options[workspace.name.to_sym] = workspace }
    WORKSPACE_TO_PURGE = PROMPT.select("Which workspace's data would you like to purge?", options)

    puts "Purging dummy data from #{WORKSPACE_TO_PURGE.name}...".colorize(:green)

    WORKSPACE_TO_PURGE.analytics_user_profiles.destroy_all
    WORKSPACE_TO_PURGE.destroy!
    
    puts "\n\n💅🏼She gone!💅🏼\n\n".colorize(:green)
    puts "Copy and paste the following SQL statements into your Clickhouse client:".colorize(:green)
    msg = <<~SQL
      DELETE FROM events WHERE swishjam_api_key = '#{WORKSPACE_TO_PURGE.public_key}'
      DELETE FROM user_identify_events WHERE swishjam_api_key = '#{WORKSPACE_TO_PURGE.public_key}'
      DELETE FROM most_recent_identify_events_per_device_mv WHERE swishjam_api_key = '#{WORKSPACE_TO_PURGE.public_key}'
      DELETE FROM most_recent_identify_events_per_device WHERE swishjam_api_key = '#{WORKSPACE_TO_PURGE.public_key}'
    SQL
    
    puts msg.colorize(:red)
  end
end