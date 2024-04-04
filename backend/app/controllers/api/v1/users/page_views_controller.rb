module Api
  module V1
    module Users
      class PageViewsController < BaseController
        def index
          limit = params[:limit] || 10
          params[:data_source] ||= 'all'
          list = ClickHouseQueries::Events::List.new(
            public_keys_for_requested_data_source,
            workspace_id: current_workspace.id,
            start_time: start_timestamp,
            end_time: end_timestamp,
            event: Analytics::Event::ReservedNames.PAGE_VIEW,
            property: 'url',
            user_profile_id: @user.id,
            limit: limit
          ).get
          render json: list, status: :ok
        end
      end
    end
  end
end
