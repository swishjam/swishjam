class RetentionCohortActivity < Transactional
  self.table_name = :retention_cohort_activities
  
  belongs_to :workspace
  belongs_to :retention_cohort

  validates :time_period, uniqueness: { scope: [:retention_cohort_id, :workspace_id] }
end