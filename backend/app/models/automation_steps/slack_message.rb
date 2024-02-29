module AutomationSteps
  class SlackMessage < AutomationStep
    self.required_jsonb_fields :config, :channel_id, :channel_name, :message_header, :message_body
    self.define_jsonb_methods :config, :channel_id, :channel_name, :message_header, :message_body

    def execute_automation!(prepared_event, executed_automation_step, as_test: false)
      slack_connection = Integrations::Destinations::Slack.for_workspace(automation.workspace)
      slack_client = ::Slack::Client.new(slack_connection.access_token)
      interpolated_message_body = EventVariableResolver.interpolated_text(message_body, prepared_event)

      if as_test
        interpolated_message_body = "#{interpolated_message_body} \n\n _:test_tube: This is a test message and was not actually triggered by a real event_"
      end
      interpolated_message_body = "#{interpolated_message_body[0..2996]}..." if interpolated_message_body.length > 3000
      executed_automation_step.execution_data[:delivered_message_body] = interpolated_message_body
      executed_automation_step.execution_data[:delivered_message_header] = message_header
      executed_automation_step.execution_data[:delivered_to_channel_name] = channel_name
      executed_automation_step.execution_data[:delivered_to_channel_id] = channel_id
      
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
      executed_automation_step.completed!(error_message: e.message)
    end
  end
end

