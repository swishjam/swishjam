module Api
  module V1
    class RetentionCohortsController < BaseController
      def index
        params[:data_source] ||= ApiKey::ReservedDataSources.PRODUCT
        oldest_cohort_date = (params[:num_of_cohorts] || 3).to_i.weeks.ago.beginning_of_week
        retention_cohorts = Rails.cache.fetch("retention_cohorts/#{public_keys_for_requested_data_source.join('-')}/#{oldest_cohort_date}}", expires_in: 1.hour) do
         UserRetentionCalculators::Weekly.get(public_keys_for_requested_data_source, oldest_cohort_date: oldest_cohort_date)
        end
        render json: retention_cohorts, status: :ok
      end
    end
  end
end