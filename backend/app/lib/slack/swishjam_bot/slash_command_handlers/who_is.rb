module Slack
  module SwishjamBot
    module SlashCommandHandlers
      class WhoIs < Slack::SwishjamBot::Base
        class InvalidSlashCommandError < StandardError; end

        def initialize(workspace, payload)
          @workspace = workspace
          @payload = payload
        end

        def return_slash_response
          with_timeout_handling do
            email = @payload[:text].strip
            user = @workspace.analytics_user_profiles.find_by(email: email)
            if user
              blocks_for_user(user)
            else
              [{ "type": "section", "text": { "type": "mrkdwn", "text": "No user found with email #{email} in Swishjam." }}]
            end
          end
        end

        private

        def blocks_for_user(user)
          blocks = [{
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*#{user.full_name || user.email}*#{user.full_name.present? ? "\n#{user.email}" : ''}"
            },
            "accessory": {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "View Profile in Swishjam"
              },
              "value": {
                "analytics_user_profile_id": user.id,
                "message_ts": @payload.dig('container', 'message_ts'),
                "channel_id": @payload.dig('channel', 'id'),
              }.to_json,
              "action_id": Slack::SwishjamBot::Actions.VISIT_USER_PROFILE,
              "url": "#{ENV['FRONTEND_URL'] || 'https://app.swishjam.com'}/users/#{user.id}"
            }
          }]
          properties_arr = [
            {
              "type": "mrkdwn",
              "text": "*First seen at:*\n#{user.first_seen_at_in_web_app&.in_time_zone('America/Los_Angeles')&.strftime('%A, %B %d @ %I:%M %p %Z') || 'Never'}"
            },
            {
              "type": "mrkdwn",
              "text": "*Last seen at:*\n#{user.last_seen_at_in_web_app&.in_time_zone('America/Los_Angeles')&.strftime('%A, %B %d @ %I:%M %p %Z') || 'Never'}"
            },
          ]
          user.metadata.each do |key, value|
            next if key.in?(%w[firstName lastName first_name last_name email fullName name full_name])
            properties_arr << { "type": "mrkdwn", "text": "*#{key.titleize}:*\n#{value}" }
          end
          properties_arr.each_slice(10).each do |sliced_properties_arr|
            blocks << { "type": "section", "fields": sliced_properties_arr }
          end
          blocks
        end
      end
    end
  end
end