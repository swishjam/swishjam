class RetentionCohortsSerializer < ActiveModel::Serializer
  attributes :id, :time_granularity, :time_period, :num_users_in_cohort, :retention_cohort_activity_periods

  def retention_cohort_activity_periods
    object.retention_cohort_activity_periods.order(:num_periods_after_cohort).map{ |a| RetentionCohortActivitiesSerializer.new(a) }
  end
end