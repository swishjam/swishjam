module Api
  module V1
    class RetentionCohortsController < BaseController
      def index
        retention_cohorts = current_workspace.retention_cohorts.includes(:retention_cohort_activities)
        render json: retention_cohorts, each_serializer: RetentionCohortsSerializer, status: :ok
      end
    end
  end
end