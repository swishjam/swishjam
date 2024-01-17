module EventTriggerSteps
  class Slack < EventTriggerStep
    # after_create :send_notification_to_slack

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

    def trigger!(event)
      access_token = event_trigger.workspace.slack_connection.access_token
      slack_client = ::Slack::Client.new(access_token)

      parsed_message_body = message_body.gsub(/\{([^}]+)\}/) do |match|
        JSON.parse(event['properties'] || '{}')[$1] || match
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

    private

    def send_notification_to_slack
      access_token = event_trigger.workspace.slack_connection.access_token
      slack_client = ::Slack::Client.new(access_token)

      slack_client.post_message_to_channel(
        channel: channel_id, 
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: "_A new Event Trigger for the `#{event_trigger.event_name}` event has been created for this channel._"
            }
          }
        ]
      )
    end
  end
end