class RetentionCohortActivitiesSerializer < ActiveModel::Serializer
  attributes :time_period, :num_active_users, :num_periods_after_cohort
end