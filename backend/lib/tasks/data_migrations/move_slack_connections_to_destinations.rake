namespace :data_migrations do
  task move_slack_connections_to_destinations: :environment do
    ActiveRecord::Base.logger.silence do
      legacy_slack_connections = SlackConnection.all
      puts "\n\nMoving #{legacy_slack_connections.count} SlackConnections to Integrations::Destinations::Slack".colorize(:yellow)
      legacy_slack_connections.each do |slack_connection|
        if Integrations::Destinations::Slack.exists?(workspace_id: slack_connection.workspace_id)
          puts "Already exists, skipping...".colorize(:yellow)
        else
          puts ".".colorize(:green)
          Integrations::Destinations::Slack.create!(
            workspace_id: slack_connection.workspace_id,
            enabled: true,
            config: { access_token: slack_connection.access_token },
            created_at: slack_connection.created_at,
            updated_at: slack_connection.updated_at,
          )
        end
      end
      puts "Moved all #{legacy_slack_connections.count} SlackConnections to Integrations::Destinations::Slack!\n\n".colorize(:green)
    end
  end
end