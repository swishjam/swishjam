module DataSynchronizers
  class UserRetention
    def initialize(workspace, oldest_cohort_date: 12.months.ago, oldest_activity_week: 1.week.ago)
      @workspace = workspace
      @oldest_cohort_date = oldest_cohort_date
      @oldest_activity_week = oldest_activity_week
    end
  
    def sync_workspaces_retention_cohort_data!
      retention_data = get_retention_data!
      if !retention_data.present?
        Rails.logger.warn "#{@workspace.name} workspace (#{@workspace.id}) has no users to generate retention data, skipping..."
      else
        retention_data.each do |cohort_date, cohort_data|
          existing_cohort = @workspace.retention_cohorts.find_by(time_granularity: 'week', time_period: cohort_date)
          if existing_cohort
            update_cohorts_activity_data(existing_cohort, cohort_data)
          else
            create_new_cohort_and_activity_periods(cohort_date, cohort_data)
          end
        end
      end
    end

    private

    def update_cohorts_activity_data(cohort, cohort_data)
      if cohort.num_users_in_cohort != cohort[:cohort_size]
        Rails.logger.warn "Updating #{@workspace.name} workspace's #{cohort.time_period} cohort (#{cohort.id}) `num_users_in_cohort` from #{cohort.num_users_in_cohort} to #{cohort[:cohort_size]}"
        cohort.update!(num_users_in_cohort: cohort_data[:cohort_size]) 
      end

      cohort_data[:activity_periods].each do |activity_period_date, activity_period_data|
        existing_cohort_activity_for_this_cohort = cohort.retention_cohort_activity_periods.find_by(time_period: activity_period_date)
        if existing_cohort_activity_for_this_cohort
          existing_cohort_activity_for_this_cohort.update!(
            num_active_users: activity_period_data[:num_active_users], 
            num_periods_after_cohort: activity_period_data[:num_periods_after_cohort], # technically this should never change, but just in case?
          )
        else
          cohort.retention_cohort_activity_periods.create!(
            workspace: @workspace, 
            time_period: activity_period_date, 
            num_active_users: activity_period_data[:num_active_users],
            num_periods_after_cohort: activity_period_data[:num_periods_after_cohort],
          )
        end
      end
    end

    def create_new_cohort_and_activity_periods(cohort_date, cohort_data)
      formatted_activity_periods = cohort_data[:activity_periods].keys.map do |activity_period_date|
        { 
          workspace: @workspace,
          time_period: activity_period_date, 
          num_active_users: cohort_data[:activity_periods][activity_period_date][:num_active_users],
          num_periods_after_cohort: cohort_data[:activity_periods][activity_period_date][:num_periods_after_cohort],
        }
      end
      @workspace.retention_cohorts.create!(
        time_granularity: 'week', 
        time_period: cohort_date, 
        num_users_in_cohort: cohort_data[:cohort_size],
        retention_cohort_activity_periods_attributes: formatted_activity_periods
      )
    end

    def get_retention_data!
      product_api_key = @workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.PRODUCT)
      retention_data = ClickHouseQueries::Users::Retention::Weekly.new(
        product_api_key.public_key, 
        oldest_cohort_date: @oldest_cohort_date, 
        oldest_activity_week: @oldest_activity_week
      ).get
    end
  end
end