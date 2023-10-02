module Api
  module V1
    module Organizations
      class PageViewsController < BaseController
        def index
          params[:data_source] ||= 'web'
          pages = ClickHouseQueries::Organizations::PageViews::MostVisited::List.new(
            public_keys_for_requested_data_source,
            organization_profile_id: @organization.id,
            start_time: start_timestamp,
            end_time: end_timestamp
          ).get
          render json: pages, status: :ok
        end
      end
    end
  end
end