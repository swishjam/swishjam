module UserRetentionCalculators
 class Weekly
  FILL_IN_COHORT_PERIODS_WITH_ZERO_USERS = false

  def self.get(public_keys, oldest_cohort_date: nil, events_to_be_considered_active: nil)
    oldest_cohort_date = (oldest_cohort_date || 4.weeks.ago).beginning_of_week
    querier = ClickHouseQueries::Users::Retention::Weekly.new(public_keys, oldest_cohort_date: oldest_cohort_date, events_to_be_considered_active: events_to_be_considered_active)

    # returns an array of hashes containing the cohort period, and the number of users in that cohort
    # if there are no users in a given cohort, it will not be included in the array
    cohort_sizes = querier.get_cohort_sizes
    formatted_cohort_sizes = Hash.new.tap do |hash|
      cohort_sizes.each do |row|
        raise "Duplicate cohort_period found in cohort_sizes: #{row['cohort_period']}" if !hash[row['cohort_period']].nil?
        hash[row['cohort_period']] = row['num_users_in_cohort']
      end
    end

    # returns an array of hashes containing the cohort period, the activity period, and the number of active users for that activity period
    # if there are no active users for a given activity period, it will not be included in the array
    activity_data = querier.get_activity_data_by_cohorts
    formatted_cohort_data = Hash.new.tap do |hash|
      activity_data.each do |row|
        cohort_period = row['cohort_period']
        activity_period = row['activity_period']
        num_active_users = row['num_active_users']

        next if activity_period.to_date < cohort_period.to_date || activity_period.to_date > Time.current.beginning_of_week.to_date
        hash[cohort_period] ||= { 'num_users_in_cohort' => formatted_cohort_sizes[cohort_period], 'activity_periods' => {} }
        hash[cohort_period]['activity_periods'][activity_period] = { 'num_active_users' => num_active_users }
      end
    end

    fill_in_cohorts_and_activity_data(oldest_cohort_date, formatted_cohort_data)
  end

  private

  def self.fill_in_cohorts_and_activity_data(starting, cohorts)
    current_cohort_period_ts = starting.beginning_of_week
    cohort_data = {}
    while current_cohort_period_ts <= Time.current.beginning_of_week
      if !FILL_IN_COHORT_PERIODS_WITH_ZERO_USERS && !cohorts[current_cohort_period_ts.to_date.to_s].nil?
        cohort_data[current_cohort_period_ts.to_date.to_s] = cohorts[current_cohort_period_ts.to_date.to_s] || { 'num_users_in_cohort' => 0, 'activity_periods' => {}}
        
        current_activity_period_ts = current_cohort_period_ts.beginning_of_week
        num_periods_after_cohort = 0
        while current_activity_period_ts <= Time.current.beginning_of_week
          cohort_data[current_cohort_period_ts.to_date.to_s]['activity_periods'][current_activity_period_ts.to_date.to_s] ||= { 'num_active_users' => 0 }
          cohort_data[current_cohort_period_ts.to_date.to_s]['activity_periods'][current_activity_period_ts.to_date.to_s]['num_periods_after_cohort'] = num_periods_after_cohort
          num_periods_after_cohort += 1
          current_activity_period_ts += 1.week
        end
      end
      
      current_cohort_period_ts += 1.week
    end
    cohort_data
  end
 end 
end