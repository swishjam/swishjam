require 'colorize'

namespace :data_migrations do
  desc "Moves all workspace `public_key` attributes to `api_keys` table"
  task migrate_workspace_api_keys: [:environment] do
    ActiveRecord::Base.logger.silence do
      puts "Starting migration...".colorize(:gray)
      workspaces = Workspace.all
      puts "Checking all #{workspaces.count} workspaces for API key migrations...\n".colorize(:gray)
      workspaces.each_with_index do |workspace, i|
        if workspace.public_key == 'DEPRECATED'
          puts "Skipping #{workspace.name} because it has already been migrated.".colorize(:yellow)
        else 
          puts "Migrating #{workspace.name}...".colorize(:orange)
          ApiKey.generate_default_keys_for(workspace)
          # override the public key for the marketing data source to the workspace's deprecated public key
          workspace.reload.api_keys.for_data_source(ApiKey::ReservedDataSources.MARKETING).update!(public_key: workspace.public_key)
          workspace.update!(public_key: 'DEPRECATED')
          puts "Migrated #{workspace.name} to API keys pattern".colorize(:gren)
        end
        puts "#{((i + 1) / workspaces.count) * 100}% complete.\n".colorize(:green)
      end
      puts "Completed migration!".colorize(:green)
    end
  end
end
