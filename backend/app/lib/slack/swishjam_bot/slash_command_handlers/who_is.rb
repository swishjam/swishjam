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
              [markdown_block("No user found with email #{email} in Swishjam.")]
            end
          end
        end

        private

        def blocks_for_user(user)
          [
            block('header', { type: 'plain_text', text: "#{user.full_name}#{user.full_name.present? ? ' - ' : ''} #{user.email}" }),
            markdown_block("First seen at: #{user.first_seen_at_in_web_app&.in_time_zone('America/Los_Angeles')&.strftime('%A, %B %d @ %I:%M %p %Z')}"),
            markdown_block("Last seen at: #{user.last_seen_at_in_web_app&.in_time_zone('America/Los_Angeles')&.strftime('%A, %B %d @ %I:%M %p %Z')}"),
            {
              type: "actions",
              block_id: "view_profile_in_swishjam",
              elements: [
                {
                  type: "button",
                  text: {
                    type: "plain_text",
                    text: "View Profile in Swishjam"
                  },
                  value: { 
                    analytics_user_profile_id: user.id,
                    # message_ts: @payload.dig('container', 'message_ts'),
                    # channel_id: @payload.dig('channel', 'id'),
                  }.to_json,
                  url: "#{ENV['FRONTEND_URL'] || 'https://app.swishjam.com'}/users/#{user.id}",
                  action_id: Slack::SwishjamBot::Actions.VISIT_USER_PROFILE
                },
                {
                  type: "button",
                  text: {
                    type: "plain_text",
                    text: "Send Email to #{user.email}"
                  },
                  value: { 
                    analytics_user_profile_id: user.id,
                    message_ts: @payload.dig('container', 'message_ts'),
                    channel_id: @payload.dig('channel', 'id'),
                  }.to_json,
                  action_id: Slack::SwishjamBot::Actions.DISPLAY_EMAIL_MODAL,
                }
              ]
            }
          ]
        end

        def markdown_block(text)
          block('section', { type: 'mrkdwn', text: text})
        end

        def block(type, text_config, additional_config = {})
          { type: type, text: text_config, **additional_config }
        end
      end
    end
  end
end