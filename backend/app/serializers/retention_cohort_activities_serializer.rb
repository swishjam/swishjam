class RetentionCohortActivitiesSerializer < ActiveModel::Serializer
  attributes :time_period, :num_active_users
end