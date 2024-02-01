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

    def trigger!(event, as_test: false)
      access_token = event_trigger.workspace.slack_connection.access_token
      slack_client = ::Slack::Client.new(access_token)

      parsed_message_body = message_body.gsub(/\{([^}]+)\}/) do |match|
        JSON.parse(event['properties'] || '{}')[$1] || match
      end
      if as_test
        parsed_message_body = "#{parsed_message_body} \n\n _:test_tube: This is a test message and was not actually triggered by a real event_"
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
              text: parsed_message_body
            }
          }
        ]
      )
    end
  end
end