module Api
  module V1
    module Users
      class PageViewsController < BaseController
        def index
          limit = params[:limit] || 10
          params[:data_source] ||= 'all'
          querier = ClickHouseQueries::Users::PageViews::MostVisited::List.new(
            public_keys_for_requested_data_source,
            user_profile_id: @user.id, 
            start_time: start_timestamp,
            end_time: end_timestamp,
            limit: limit
          )
          render json: querier.get, status: :ok
        end
      end
    end
  end
end
