class EventTrigger < Transactional
  belongs_to :workspace
  has_many :event_trigger_steps, dependent: :destroy
  accepts_nested_attributes_for :event_trigger_steps
  has_many :triggered_event_triggers, dependent: :destroy

  scope :enabled, -> { where(enabled: true) }
  scope :disabled, -> { where(enabled: false) }

  attribute :conditional_statements, :jsonb, default: []

  validates :event_name, presence: true
  validate :has_valid_conditional_statements

  after_create :send_new_trigger_notification_to_slack_if_necessary

  def trigger_if_conditions_are_met!(event, as_test: false)
    if triggered_event_triggers.find_by(event_uuid: event['uuid']).present?
      Sentry.capture_message("Duplicate EventTrigger prevented. EventTrigger #{id} already triggered for event #{event['uuid']} (#{event['name']} event for #{workspace.name} workspace).")
    elsif EventTriggers::ConditionalStatementsEvaluator.new(event).event_meets_all_conditions?(conditional_statements)
      event_trigger_steps.each{ |step| step.trigger!(event, as_test: as_test) }
      return true if as_test
      seconds_since_occurred_at = event['occurred_at'] ? Time.current - Time.parse(event['occurred_at']) : -1
      if seconds_since_occurred_at > (ENV['EVENT_TRIGGER_LAG_WARNING_THRESHOLD'] || 60 * 5).to_i
        Sentry.capture_message("EventTrigger #{id} took #{seconds_since_occurred_at} seconds to reach trigger logic.")
        return if ENV['DISABLE_EVENT_TRIGGER_WHEN_LAGGING']
      end
      triggered_event_triggers.create!(
        workspace: workspace, 
        seconds_from_occurred_at_to_triggered: seconds_since_occurred_at,
        event_json: event,
        event_uuid: event['uuid'],
      )
    else
      Sentry.capture_message("Event Trigger conditions not met. Event properties: #{event['properties']}. Conditions: #{conditional_statements}.")
      false
    end
  end

  private

  def has_valid_conditional_statements
    conditional_statements.each do |statement|
      if statement['property'].blank? || statement['condition'].blank? || (statement['property_value'].blank? && statement['condition'] != 'is_defined')
        errors.add(:conditional_statements, 'must have a property, condition, and property_value.')
      elsif !['equals', 'does_not_equal', 'contains', 'does_not_contain', 'ends_with', 'does_not_end_with', 'is_defined'].include?(statement['condition'])
        errors.add(:base, "#{statement['condition']} is not a valid condition, valid conditions are: `equals`, `contains`, `does_not_contain`, `ends_with`, `does_not_end_with`.")
      end
    end
  end

  def send_new_trigger_notification_to_slack_if_necessary
    return if !enabled
    slack_trigger_step = event_trigger_steps.find_by(type: EventTriggerSteps::Slack.to_s)
    return if slack_trigger_step.nil?
    access_token = workspace.slack_connection.access_token
    slack_client = ::Slack::Client.new(access_token)

    slack_client.post_message_to_channel(
      channel: slack_trigger_step.channel_id, 
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: "_A new Event Trigger for the `#{event_name}` event has been created for this channel._"
          }
        }
      ]
    )
  end
end