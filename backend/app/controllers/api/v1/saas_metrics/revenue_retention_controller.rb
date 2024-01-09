module Api
  module V1
    module SaasMetrics
      class RevenueRetentionController < BaseController
        def index
          starting_cohort_date = (params[:num_cohorts] || 8).to_i.months.ago.beginning_of_month
          retention_data = RevenueRetention::Getter.new(current_workspace.id, starting_cohort_date: starting_cohort_date).get
          render json: retention_data, status: :ok
        end
      end
    end
  end
end