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

    def trigger!(prepared_event, triggered_event_trigger, as_test: false)
      slack_connection = Integrations::Destinations::Slack.for_workspace(event_trigger.workspace)
      slack_client = ::Slack::Client.new(slack_connection.access_token)
      interpolated_message_body = EventVariableResolver.interpolated_text(message_body, prepared_event)

      if as_test
        interpolated_message_body = "#{interpolated_message_body} \n\n _:test_tube: This is a test message and was not actually triggered by a real event_"
      end
      interpolated_message_body = "#{interpolated_message_body[0..2996]}..." if interpolated_message_body.length > 3000
      
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