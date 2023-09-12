module Api
  module V1
    class PageViewsController < BaseController
      def index
        limit = params[:limit] || 10
        analytics_family = params[:analytics_family] || 'marketing'
        raise "Invalid analytics_family provided: #{analytics_family}" unless %w[marketing product].include?(analytics_family)
        page_view_counts = ClickHouseQueries::PageViews::MostVisited::List.new(
          current_workspace.public_key,
          analytics_family: analytics_family,
          start_time: start_timestamp,
          end_time: end_timestamp,
          limit: limit
        ).get
        render json: { page_view_counts: page_view_counts, start_time: start_timestamp, end_time: end_timestamp }, status: :ok
      end
    end
  end
end
