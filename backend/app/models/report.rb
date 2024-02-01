class Report < Transactional
  belongs_to :workspace
  has_many :triggered_reports, dependent: :destroy

  validates :name, presence: true
  validates :cadence, presence: true, inclusion: { in: %w(daily weekly monthly) }
  validates :sending_mechanism, presence: true, inclusion: { in: %w(slack email sms) }
  validates :config, presence: true
  validate :slack_channel_id_is_present_if_slack

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
    return unless workspace.slack_connection.present?
    access_token = workspace.slack_connection.access_token
    slack_client = ::Slack::Client.new(access_token)
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

  def slack_channel_id_is_present_if_slack
    if sending_mechanism == 'slack' && config && slack_channel_id.blank?
      errors.add(:config, '`slack_channel_id` is required')
    end
  end
end