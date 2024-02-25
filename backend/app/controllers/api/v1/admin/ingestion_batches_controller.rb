module Api
  module V1
    module Admin
      class IngestionBatchesController < BaseController
        def show
        end

        def index
          event_type = params[:type] || params[:event_type] || params[:name]
          if event_type
            render json: IngestionBatch.where(event_type: event_type).order(started_at: :desc).limit(params[:limit] || 10), status: :ok
          else
            render json: IngestionBatch.order(started_at: :desc).limit(params[:limit] || 10), status: :ok
          end
        end
      end
    end
  end
end