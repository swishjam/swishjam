class RetentionCohortActivityPeriod < Transactional
  belongs_to :workspace
  belongs_to :retention_cohort

  validates :time_period, presence: true, uniqueness: { scope: [:retention_cohort_id, :workspace_id] }
  validates :num_periods_after_cohort, presence: true, uniqueness: { scope: [:retention_cohort_id, :workspace_id] }
end