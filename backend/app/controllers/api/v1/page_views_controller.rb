module Api
  module V1
    class PageViewsController < BaseController
      def index
        limit = params[:limit] || 10
        params[:data_source] ||= ApiKey::ReservedDataSources.MARKETING
        page_view_counts = ClickHouseQueries::PageViews::MostVisited::List.new(
          public_keys_for_requested_data_source,
          start_time: start_timestamp,
          end_time: end_timestamp,
          limit: limit
        ).get
        render json: { page_view_counts: page_view_counts, start_time: start_timestamp, end_time: end_timestamp }, status: :ok
      end
    end
  end
end
