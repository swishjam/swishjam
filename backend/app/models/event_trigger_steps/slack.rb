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
        variable_name = $1.strip
        resolved_variable_value = prepared_event.properties[variable_name]
        if resolved_variable_value.nil? && variable_name == 'user_attributes'
          resolved_variable_value = prepared_event.user_properties.to_s
        elsif resolved_variable_value.nil? && variable_name == 'organization_attributes'
          resolved_variable_value = prepared_event.organization_properties.to_s
        end
        resolved_variable_value || match
      end

      if as_test
        interpolated_message_body = "#{parsed_message_body} \n\n _:test_tube: This is a test message and was not actually triggered by a real event_"
      end
      interpolated_message_body = "#{parsed_message_body[0..2996]}..." if parsed_message_body.length > 3000
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