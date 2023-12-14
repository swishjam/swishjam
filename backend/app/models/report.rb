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

  def slack_channel_id
    config['slack_channel_id']
  end

  private

  def slack_channel_id_is_present_if_slack
    if sending_mechanism == 'slack' && config && slack_channel_id.blank?
      errors.add(:config, '`slack_channel_id` is required')
    end
  end
end