module Api
  module V1
    module Organizations
      class EventsController < BaseController
        def index
          params[:data_source] ||= 'all'
          limit = (params[:limit] || 200).to_i
          events = ClickHouseQueries::Events::List.new(
            public_keys_for_requested_data_source,
            start_time: start_timestamp,
            end_time: end_timestamp,
            workspace_id: current_workspace.id,
            organization_profile_id: @organization.id,
            limit: limit,
          ).get
          render json: events, status: :ok
        end
      end
    end
  end
end