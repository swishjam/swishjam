class RetentionCohort < Transactional
  belongs_to :workspace
  has_many :retention_cohort_activities, class_name: RetentionCohortActivity.to_s, dependent: :destroy

  validates :time_period, uniqueness: { scope: [:time_granularity, :workspace_id] }
end