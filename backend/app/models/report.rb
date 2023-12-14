class Report < Transactional
  belongs_to :workspace
  has_many :triggered_reports, dependent: :destroy

  validates :name, presence: true
  validates :cadence, presence: true, inclusion: { in: %w(daily weekly monthly) }
  validates :sending_mechanism, presence: true, inclusion: { in: %w(slack email sms) }
  validates :config, presence: true
  validate :channel_id_is_present_if_slack

  def channel_id
    config['channel_id']
  end

  private

  def channel_id_is_present_if_slack
    if sending_mechanism == 'slack' && config && channel_id.blank?
      errors.add(:config, '`channel_id` is required')
    end
  end
end