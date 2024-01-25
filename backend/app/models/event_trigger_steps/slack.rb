module EventTriggerSteps
  class Slack < EventTriggerStep
    def channel_id
      config['channel_id']
    end

    def channel_name
      config['channel_name']
    end

    def message_header
      config['message_header']
    end

    def message_body
      config['message_body']
    end

    def trigger!(prepared_event, as_test: false)
      access_token = event_trigger.workspace.slack_connection.access_token
      slack_client = ::Slack::Client.new(access_token)

      interpolated_message_body = message_body.gsub(/\{([^}]+)\}/) do |match|
        prepared_event.properties[$1] || match
      end
      if as_test
        interpolated_message_body = "_:test_tube: This is a test message and was not actually triggered by a real event:_\n\n #{interpolated_message_body}"
      end
      slack_client.post_message_to_channel(
        channel: channel_id, 
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: message_header,
              emoji: true
            }
          }, 
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: interpolated_message_body
            }
          }
        ]
      )
    end
  end
end