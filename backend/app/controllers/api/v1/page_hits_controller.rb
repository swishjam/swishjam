module Api
  module V1
    class PageHitsController < BaseController
      def top_pages
        start_time = params[:start_time] || 7.days.ago
        end_time = params[:end_time] || Time.zone.now

        render json: {
          top_pages: current_organization.page_hits.where(start_time: start_time..end_time).group_by{ |ph| ph.friendly_url }.transform_values(&:count),
          start_time: start_time,
          end_time: end_time,
        }, status: :ok
      end
    end
  end
end