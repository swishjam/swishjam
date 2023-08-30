module Api
  module V1
    class PageHitsController < BaseController
      def index
        limit = params[:limit] || 10
        hosts_to_filter = current_workspace.url_segments.pluck(:url_host)
        querier = ClickHouseQueries::PageViews::Top.new(current_workspace.public_key, url_hosts: hosts_to_filter, limit: limit, start_time: start_timestamp, end_time: end_timestamp)
        render json: { top_pages: querier.top, start_time: start_timestamp, end_time: end_timestamp }, status: :ok
      end
    end
  end
end
