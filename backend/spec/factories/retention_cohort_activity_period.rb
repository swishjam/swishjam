FactoryBot.define do
  factory :retention_cohort_activity_period do
    association :workspace
    association :retention_cohort
    num_active_users { 5 }
    num_periods_after_cohort { 0 }
    time_period { Time.current.beginning_of_week.to_date }
  end
end