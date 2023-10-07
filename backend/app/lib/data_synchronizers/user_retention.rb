module DataSynchronizers
  class UserRetention
    def initialize(workspace, oldest_cohort: 12.months.ago, oldest_activity_week: 1.week.ago)
      @workspace = workspace
      @oldest_cohort = oldest_cohort
      @oldest_activity_week = oldest_activity_week
    end
  
    def sync_workspaces_retention_cohort_data!
      retention_data = get_retention_data!
      retention_data.each do |cohort_activity_data|
        existing_cohort = @workspace.retention_cohorts.find_by(time_granularity: 'week', time_period: cohort_activity_data[:cohort])
        if existing_cohort
          update_cohort_with_activity_data(existing_cohort, cohort_activity_data)
        else
          create_new_cohort_for_activity_data(cohort_activity_data)
        end
      end
    end

    private

    def update_cohort_with_activity_data(cohort, cohort_activity_data)
      cohort.update!(num_users: cohort_activity_data[:cohort_size])
      existing_cohort_activity_for_this_cohort = cohort.retention_cohort_activities.find_by(time_period: cohort_activity_data[:retention_week])
      if existing_cohort_activity_for_this_cohort
        existing_cohort_activity_for_this_cohort.update!(workspace: @workspace, num_active_users: cohort_activity_data[:num_active_users])
      else
        cohort.retention_cohort_activities.create!(
          workspace: @workspace, 
          time_period: cohort_activity_data[:retention_week], 
          num_active_users: cohort_activity_data[:num_active_users]
        )
      end
    end

    def create_new_cohort_for_activity_data(cohort_activity_data)
      cohort = @workspace.retention_cohorts.create!(
        time_granularity: 'week', 
        time_period: cohort_activity_data[:cohort], 
        num_users: cohort_activity_data[:cohort_size]
      )
      cohort.retention_cohort_activities.create!(
        workspace: @workspace, 
        time_period: cohort_activity_data[:retention_week], 
        num_active_users: cohort_activity_data[:num_active_users]
      )
    end

    def get_retention_data!
      product_api_key = @workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.PRODUCT)
      retention_data = ClickHouseQueries::Users::Retention::Weekly.new(
        product_api_key.public_key, 
        oldest_cohort: @oldest_cohort, 
        oldest_activity_week: @oldest_activity_week
      ).get
    end
  end
end