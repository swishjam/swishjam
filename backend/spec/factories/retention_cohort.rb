FactoryBot.define do
  factory :retention_cohort do
    association :workspace
    time_granularity { 'week' }
    time_period { Time.current.beginning_of_week.to_date }
    num_users_in_cohort { 10 }
  end
end