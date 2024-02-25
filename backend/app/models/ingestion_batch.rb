class IngestionBatch < Transactional
  scope :successful, -> { where(error_message: nil).where.not(completed_at: nil) }
  scope :failed, -> { where.not(error_message: nil)}
  scope :completed, -> { where.not(completed_at: nil) }
  scope :pending, -> { where(completed_at: nil) }

  before_save do 
    self.num_successful_records ||= 0
    self.num_failed_records ||= 0
    self.num_records ||= 0
    self.started_at ||= Time.current
  end

  def self.start!(name, num_records: 0)
    create!(event_type: name, num_records: num_records)
  end

  def complete!(num_successful_records: nil, num_failed_records: nil, error_message: nil)
    self.num_successful_records = num_successful_records if !num_successful_records.nil?
    self.num_failed_records = num_failed_records if !num_failed_records.nil?
    self.error_message = error_message
    self.completed_at = Time.current
    self.num_seconds_to_complete = completed_at - started_at
    save!
    self
  end

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