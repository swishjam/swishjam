class DataSync < Transactional
  belongs_to :workspace

  validates :provider, presence: true, inclusion: { in: %w[stripe] }

  scope :completed, -> { where.not(completed_at: nil) }
  scope :successful, -> { completed.where(error_message: nil) }
  scope :failed, -> { where.not(error_message: nil) }
  scope :in_progress, -> { where(completed_at: nil) }
  scope :pending, -> { in_progress }

  def completed!
    update!(completed_at: Time.current, duration_in_seconds: Time.current - started_at)
  end

  def failed!(error_message)
    update!(error_message: error_message, completed_at: Time.current, duration_in_seconds: Time.current - started_at)
  end

  def completed?
    completed_at.present?
  end

  def successful?
    completed? && error_message.blank?
  end

  def failed?
    completed? && error_message.present?
  end

  def in_progress?
    !completed?
  end
  alias pending? in_progress?

  def previous_successful_sync
    workspace.data_syncs.where(provider: provider).successful.where('started_at < ?', started_at).order(started_at: :desc).limit(1).first
  end
end