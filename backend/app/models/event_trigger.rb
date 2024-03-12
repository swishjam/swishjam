class EventTrigger < Transactional
  VALID_CONDITIONAL_OPERATORS = %w[equals does_not_equal contains does_not_contain ends_with does_not_end_with is_defined is_not_defined greater_than less_than greater_than_or_equal_to less_than_or_equal_to]
  belongs_to :workspace
  # technically not optional but don't want to break existing records
  belongs_to :created_by_user, class_name: User.to_s, optional: true
  has_many :event_trigger_steps, dependent: :destroy
  accepts_nested_attributes_for :event_trigger_steps
  has_many :triggered_event_triggers, dependent: :destroy
  has_many :triggered_event_trigger_steps, through: :event_trigger_steps

  scope :enabled, -> { where(enabled: true) }
  scope :disabled, -> { where(enabled: false) }
  scope :has_event_trigger_step_type, ->(type) { joins(:event_trigger_steps).where(event_trigger_steps: { type: type.to_s }) }

  attribute :conditional_statements, :jsonb, default: []

  validates :event_name, presence: true
  validate :has_valid_conditional_statements

  after_create :send_new_trigger_notification_to_slack_if_necessary

  def trigger_if_conditions_are_met!(prepared_event, as_test: false, is_retry: false)
    if !is_retry && triggered_event_triggers.find_by(event_uuid: prepared_event.uuid).present?
      Sentry.capture_message("Duplicate EventTrigger prevented. EventTrigger #{id} already triggered for event #{prepared_event.uuid} (#{prepared_event.name} event for #{workspace.name} workspace).")
      false
    elsif EventTriggers::ConditionalStatementsEvaluator.new(prepared_event).event_meets_all_conditions?(conditional_statements)
      seconds_since_occurred_at = Time.current - prepared_event.occurred_at
      if !is_retry && seconds_since_occurred_at > (ENV['EVENT_TRIGGER_LAG_WARNING_THRESHOLD'] || 60 * 5).to_i
        if ENV['DISABLE_EVENT_TRIGGER_WHEN_LAGGING']
          Sentry.capture_message("EventTrigger #{id} took #{seconds_since_occurred_at} seconds to reach trigger logic, HAULTING TRIGGER FROM EXECUTING.")
          return
        else
          Sentry.capture_message("EventTrigger #{id} took #{seconds_since_occurred_at} seconds to reach trigger logic.")
        end
      end
      triggered_event_trigger = triggered_event_triggers.create!(
        workspace: workspace, 
        seconds_from_occurred_at_to_triggered: is_retry ? nil : seconds_since_occurred_at,
        event_json: prepared_event.as_json,
        event_uuid: prepared_event.uuid,
      )
      first_step.trigger!(prepared_event, triggered_event_trigger, as_test: as_test)
      # event_trigger_steps.each{ |step| step.trigger!(prepared_event, triggered_event_trigger, as_test: as_test) }
      triggered_event_trigger
    else
      false
    end
  end

  def first_step
    # TODO: this should probably be a has_one relationship
    event_trigger_steps.first
  end

  private

  def has_valid_conditional_statements
    conditional_statements.each do |statement|
      if statement['property'].blank? || statement['condition'].blank? || (statement['property_value'].blank? && statement['condition'] != 'is_defined')
        errors.add(:conditional_statements, 'must have a property, condition, and property_value.')
      elsif !self.class::VALID_CONDITIONAL_OPERATORS.include?(statement['condition'])
        errors.add(:base, "#{statement['condition']} is not a valid condition, valid conditions are: #{self.class::VALID_CONDITIONAL_OPERATORS.join(', ')}.")
      end
    end
  end

  def send_new_trigger_notification_to_slack_if_necessary
    return if !enabled
    slack_trigger_step = event_trigger_steps.find_by(type: EventTriggerSteps::Slack.to_s)
    return if slack_trigger_step.nil?
    slack_connection = Integrations::Destinations::Slack.for_workspace(workspace)
    return if slack_connection.nil?
    slack_client = ::Slack::Client.new(slack_connection.access_token)

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