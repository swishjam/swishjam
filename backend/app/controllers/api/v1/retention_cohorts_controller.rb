module Api
  module V1
    class RetentionCohortsController < BaseController
      def index
        params[:data_source] ||= ApiKey::ReservedDataSources.PRODUCT
        oldest_cohort_date = (params[:num_of_cohorts] || 3).to_i.weeks.ago.beginning_of_week
        retention_cohorts = UserRetentionCalculators::Weekly.get(public_keys_for_requested_data_source, oldest_cohort_date: oldest_cohort_date)
        render json: retention_cohorts, status: :ok
      end
    end
  end
end