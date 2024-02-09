class Report < Transactional
  belongs_to :workspace
  has_many :triggered_reports, dependent: :destroy

  validates :name, presence: true
  validates :cadence, presence: true, inclusion: { in: %w(daily weekly monthly) }
  validates :sending_mechanism, presence: true, inclusion: { in: %w(slack email sms) }
  validates :config, presence: true
  validate :has_valid_config_values

  scope :enabled, -> { where(enabled: true) }
  scope :disabled, -> { where(enabled: false) }
  scope :daily_cadence, -> { where(cadence: 'daily') }
  scope :weekly_cadence, -> { where(cadence: 'weekly') }
  scope :monthly_cadence, -> { where(cadence: 'monthly') }

  after_create :send_notice_to_slack_channel

  def slack_channel_id
    config['slack_channel_id']
  end

  private

  def send_notice_to_slack_channel
    return unless sending_mechanism == 'slack'
    return unless slack_channel_id.present?
    slack_connection = Integrations::Destinations::Slack.for_workspace(workspace)
    return unless slack_connection.present?
    slack_client = ::Slack::Client.new(slack_connection.access_token)
    slack_client.post_message_to_channel(
      channel: slack_channel_id,
      unfurl_links: false,
      unfurl_media: false,
      blocks: [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "_A new Swishjam report has been subscribed to this channel: *#{name}*_"
          }
        }
      ]
    )
  end

  def has_valid_config_values
    if sending_mechanism == 'slack' && config && slack_channel_id.blank?
      errors.add(:config, '`slack_channel_id` is required')
    elsif sending_mechanism == 'slack' && config && (config['sections'] || []).any?{ |s| !['web', 'product', 'revenue'].include?(s['type']) }
      errors.add(:config, 'Invalid `sections` config, must be one of: "web", "product", or "revenue".')
    end
  end
end