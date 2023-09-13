module Api
  module V1
    module Users
      class PageViewsController < BaseController
        def index
          limit = params[:limit] || 10
          analytics_family = params[:analytics_family] || 'product'
          if !['product', 'marketing'].include?(analytics_family)
            render json: { error: 'Invalid analytics_family' }, status: :bad_request
            return
          end
          querier = ClickHouseQueries::Users::PageViews::MostVisited::List.new(
            current_workspace.public_key, 
            user_profile_id: @user.id, 
            analytics_family: analytics_family,
            # start_time: start_timestamp,
            start_time: 1.year.ago,
            end_time: end_timestamp,
            limit: limit
          )
          render json: querier.get, status: :ok
        end
      end
    end
  end
end
