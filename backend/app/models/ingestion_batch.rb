class IngestionBatch < Transactional
  scope :successful, -> { where(error_message: nil).where.not(completed_at: nil) }
  scope :failed, -> { where.not(error_message: nil)}
  scope :completed, -> { where.not(completed_at: nil) }
  scope :pending, -> { where(completed_at: nil) }

  def completed?
    !completed_at.nil?
  end

  def pending?
    !completed?
  end

  def successful?
    completed? && error_message.nil?
  end

  def failed?
    !error_message.nil?
  end
end