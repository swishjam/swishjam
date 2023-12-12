class DataSync < Transactional
  belongs_to :workspace

  validates :provider, presence: true, inclusion: { in: %w[stripe] }
  
  scope :by_provider, ->(provider) { where(provider: provider) }
  scope :pending, -> { where(completed_at: nil) }
  scope :completed, -> { where.not(completed_at: nil) }
  scope :complete_successfully, -> { completed.where(error_message: nil) }
  scope :failed, -> { where.not(error_message: nil) }

  def previous_data_sync
    workspace.data_syncs.by_provider(provider).where('completed_at < ?', started_at).order(completed_at: :desc).first
  end

  def completed!
    update!(completed_at: Time.current, duration_in_seconds: Time.current - started_at)
  end

  def failed!(error_message)
    Sentry.capture_message("Data sync #{id} failed for workspace #{workspace.name}: #{error_message}")
    update!(error_message: error_message, completed_at: Time.current, duration_in_seconds: Time.current - started_at)
  end

  def succeeded?
    completed? && !failed?
  end

  def failed?
    error_message.present?
  end

  def completed?
    completed_at.present?
  end

  def pending?
    !completed?
  end
end