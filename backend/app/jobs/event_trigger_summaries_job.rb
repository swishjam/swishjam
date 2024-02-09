class EventTriggerSummariesJob
  include Sidekiq::Worker
  queue_as :default

  def perform
    Workspace.all.each do |workspace|
      slack_connection = Integrations::Destinations::Slack.for_workspace(workspace)
      next if slack_connection.nil?
      next if workspace.event_triggers.enabled.count == 0
      slack_client = Slack::Client.new(slack_connection.access_token)
      event_triggers_by_slack_channel_id = workspace.event_triggers.enabled.group_by { |event_trigger| event_trigger.event_trigger_steps.first.channel_id }
      event_triggers_by_slack_channel_id.each do |slack_channel_id, event_triggers|
        header = {
          type: 'header',
          text: {
            type: 'plain_text',
            text: ":bar_chart: Event Triggers Week in Review",
            emoji: true
          }
        }
        sub_header = {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: ":calendar: #{1.week.ago.beginning_of_week.strftime('%A, %B %d')} - #{1.week.ago.end_of_week.strftime('%A, %B %d')}"
          }
        }
        message_body = event_triggers.map do |event_trigger|
          num_triggers_last_week = event_trigger.triggered_event_triggers.where('created_at >= ? AND created_at < ?', 1.week.ago.beginning_of_week, 1.week.ago.end_of_week).count
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: "#{event_trigger.event_trigger_steps.first.message_header}: #{num_triggers_last_week} triggers"
            }
          }
        end
        blocks = [header, sub_header, { type: 'divider' }, message_body].flatten
        slack_client.post_message_to_channel(channel: slack_channel_id, blocks: blocks)
      rescue => e
        Sentry.capture_message("Failed to send Event Trigger Summary to slack channel #{slack_channel_id} for workspace #{workspace.name} (#{workspace.id}): #{e.inspect}")
      end
    end
  end
end