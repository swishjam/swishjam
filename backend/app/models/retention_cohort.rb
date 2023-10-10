class RetentionCohort < Transactional
  belongs_to :workspace
  has_many :retention_cohort_activity_periods, dependent: :destroy
  accepts_nested_attributes_for :retention_cohort_activity_periods

  validates :time_period, uniqueness: { scope: [:time_granularity, :workspace_id] }
end