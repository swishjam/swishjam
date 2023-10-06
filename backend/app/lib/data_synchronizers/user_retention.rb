module DataSynchronizers
  class UserRetention
    def initialize(workspace)
      @workspace = workspace
    end

    def generate_retention_data!

    end

    def users_by_registration_cohort
      @users_by_registration_cohort ||= @workspace.analytics_user_profiles.group_by{ |u| u.created_at.beginning_of_week }
    end

    def cohorts
      @cohorts ||= users_by_registration_cohort.keys
    end
  end
end