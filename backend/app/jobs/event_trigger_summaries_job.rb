class EventTriggerSummariesJob
  include Sidekiq::Worker
  queue_as :default

  def perform
    Workspace.all.each do |workspace|
      next if workspace.slack_connection.nil?
      next if workspace.event_triggers.enabled.count == 0
      slack_client = Slack::Client.new(workspace.slack_connection.access_token)
      message_body = workspace.event_triggers.enabled.map do |event_trigger|
        num_triggers_last_week = event_trigger.triggered_event_triggers.where('created_at >= ? AND created_at < ?', 1.week.ago.beginning_of_week, 1.week.ago.end_of_week).count
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: "#{event_trigger.event_trigger_steps.first.message_header}: #{num_triggers_last_week} triggers"
          }
        }
      end
      # right now we're defaulting to the first event trigger's slack channel, but we should make this configurable in the future
      slack_channel_id = workspace.event_triggers.first.event_trigger_steps.first.channel_id
      slack_client.post_message_to_channel(
        channel: slack_channel_id,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: ":calendar: Event Triggers Week in Review (#{1.week.ago.beginning_of_week.strftime('%B %d, %Y')} - #{1.week.ago.end_of_week.strftime('%B %d, %Y')})",
              emoji: true
            }
          },
          {
            type: 'divider'
          },
          message_body,
        ].flatten
      )
    end
  end
end