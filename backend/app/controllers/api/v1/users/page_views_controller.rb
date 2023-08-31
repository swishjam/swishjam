module Api
  module V1
    module Users
      class PageViewsController < BaseController
        def index
          limit = params[:limit] || 10
          url_hosts = current_workspace.url_segments.pluck(:url_host)
          querier = ClickHouseQueries::Users::PageViews::Counts.new(
            current_workspace.public_key, 
            user_profile_id: @user.id, 
            url_hosts: url_hosts, 
            # start_time: start_timestamp,
            start_time: 1.year.ago,
            end_time: end_timestamp
          )
          render json: querier.get, status: :ok
        end
      end
    end
  end
end
