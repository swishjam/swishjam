module DummyData
  class RetentionData
    class << self
      def generate!(workspace, num_months_of_cohorts: 3)
        progress_bar = TTY::ProgressBar.new("Seeding 6 months worth of retention data [:bar]", total: num_months_of_cohorts.months / 1.week, bar_format: :block)

        current_retention_cohort_date = num_months_of_cohorts.months.ago.beginning_of_week
        while current_retention_cohort_date <= Time.current
          cohort = RetentionCohort.create!(
            workspace: workspace,
            time_granularity: 'week',
            time_period: current_retention_cohort_date.to_date.to_s,
            num_users_in_cohort: rand(25..200)
          )
          
          current_activity_period_date = current_retention_cohort_date
          num_periods_after_cohort_start = 0
          while current_activity_period_date <= Time.current
            percent_less_from_initial_cohort_size = num_periods_after_cohort_start.to_f * (rand(5..10) / 100.0)
            RetentionCohortActivityPeriod.create!(
              workspace: workspace,
              retention_cohort: cohort,
              num_active_users: [0, cohort.num_users_in_cohort * (1  - percent_less_from_initial_cohort_size)].max,
              num_periods_after_cohort: num_periods_after_cohort_start,
              time_period: current_activity_period_date.to_date.to_s,
            )
            num_periods_after_cohort_start += 1
            current_activity_period_date += 1.week
          end
          current_retention_cohort_date += 1.week
          progress_bar.advance
        end
      end
    end
  end
end