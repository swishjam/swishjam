module Api
  module V1
    class PageHitsController < BaseController
      def index
        limit = params[:limit] || 10
        top_pages = ClickHouseQueries::PageViews::Top.new(current_workspace.public_key, limit: limit, start_time: start_timestamp, end_time: end_timestamp).top
        render json: { top_pages: top_pages, start_time: start_timestamp, end_time: end_timestamp }, status: :ok
      end
    end
  end
end
