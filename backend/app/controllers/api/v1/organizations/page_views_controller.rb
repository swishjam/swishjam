module Api
  module V1
    module Organizations
      class PageViewsController < BaseController
        def index
          analytics_family = params[:analytics_family] || 'product'
          if !['product', 'marketing'].include?(analytics_family)
            render json: { error: 'Invalid analytics_family' }, status: :bad_request
            return
          end
          pages = ClickHouseQueries::Organizations::PageViews::MostVisited::List.new(
            current_workspace.public_key,
            organization_profile_id: @organization.id,
            analytics_family: analytics_family,
            start_time: start_timestamp,
            end_time: end_timestamp
          ).get
          render json: pages, status: :ok
        end
      end
    end
  end
end