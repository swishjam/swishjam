module Api
  module V1
    module Users
      class EventsController < BaseController
        def index
          limit = params[:limit] || 10
          params[:data_source] ||= 'all'
          events = ClickHouseQueries::Events::List.new(
            public_keys_for_requested_data_source,
            workspace_id: current_workspace.id,
            user_profile_id: @user.id,
            start_time: start_timestamp,
            end_time: end_timestamp,
            limit: limit,
          ).get
          render json: events, status: :ok
        end
      end
    end
  end
end