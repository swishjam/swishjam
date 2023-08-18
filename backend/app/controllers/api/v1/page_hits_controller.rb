module Api
  module V1
    class PageHitsController < BaseController
      def index
        limit = params[:limit] || 10
        top_pages = Analytics::PageHit.select(:url_host, :url_path, "COUNT(*) as count")
                                        .for_swishjam_organization(current_organization)
                                        .starting_at_or_after(start_timestamp)
                                        .starting_at_or_before(end_timestamp)
                                        .group(:url_host, :url_path)
                                        .order(count: :DESC)
                                        .limit(limit)
                                        .to_a
                                        .map{ |p| { url: p.url_host + p.url_path, count: p.count }}
        render json: { top_pages: top_pages, start_time: start_timestamp, end_time: end_timestamp }, status: :ok
      end
    end
  end
end
