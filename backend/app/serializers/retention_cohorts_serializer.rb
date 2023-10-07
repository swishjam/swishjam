class RetentionCohortsSerializer < ActiveModel::Serializer
  attributes :id, :time_granularity, :time_period, :num_users, :retention_cohort_activities

  def retention_cohort_activities
    object.retention_cohort_activities.map{ |a| RetentionCohortActivitiesSerializer.new(a) }
  end
end