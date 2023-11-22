module UserRetentionCalculators
 class Weekly
  def self.get(public_keys, oldest_cohort_date: nil, events_to_be_considered_active: nil)
    querier = ClickHouseQueries::Users::Retention::Weekly.new(public_keys, oldest_cohort_date: oldest_cohort_date, events_to_be_considered_active: events_to_be_considered_active)
    
    cohort_sizes = querier.get_cohort_sizes
    formatted_cohort_sizes = Hash.new.tap do |hash|
      cohort_sizes.each do |row|
        raise "Duplicate cohort_period found in cohort_sizes: #{row['cohort_period']}" if !hash[row['cohort_period']].nil?
        hash[row['cohort_period']] = row['num_users_in_cohort']
      end
    end

    retention_data = querier.get_retention_data
    formatted_cohort_data = Hash.new.tap do |hash|
      retention_data.each do |row|
        cohort_period = row['cohort_period']
        activity_period = row['activity_period']
        num_active_users = row['num_active_users']
        hash[cohort_period] ||= { 'num_users_in_cohort' => formatted_cohort_sizes[cohort_period], 'activity_periods' => {} }
        hash[cohort_period]['activity_periods'][activity_period] = num_active_users
      end
    end
  end
 end 
end