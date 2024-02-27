module AutomationSteps
  class SlackMessage < AutomationStep
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

    def execute_automation!(prepared_event, executed_automation_step, as_test: false)
      slack_connection = Integrations::Destinations::Slack.for_workspace(automation.workspace)
      slack_client = ::Slack::Client.new(slack_connection.access_token)
      interpolated_message_body = EventVariableResolver.interpolated_text(message_body, prepared_event)

      if as_test
        interpolated_message_body = "#{interpolated_message_body} \n\n _:test_tube: This is a test message and was not actually triggered by a real event_"
      end
      interpolated_message_body = "#{interpolated_message_body[0..2996]}..." if interpolated_message_body.length > 3000
      executed_automation_step.execution_data = { message_body: interpolated_message_body, message_header: message_header }
      
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
      executed_automation_step.completed!
    rescue => e
      Sentry.capture_exception(e)
      executed_automation_step.completed!
    end
  end
end

