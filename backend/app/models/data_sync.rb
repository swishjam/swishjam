class DataSync < Transactional
  belongs_to :workspace

  validates :provider, presence: true, inclusion: { in: %w[stripe] }

  def completed!
    update!(completed_at: Time.current, duration_in_seconds: Time.current - started_at)
  end

  def failed!(error_message)
    update!(error_message: error_message, completed_at: Time.current, duration_in_seconds: Time.current - started_at)
  end
end