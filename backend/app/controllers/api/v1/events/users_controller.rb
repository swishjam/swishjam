module Api
  module V1
    module Events
      class UsersController < BaseController
        def index
          if !params[:event_name].present?
            render json: { error: 'event_name is required' }, status: :bad_request
            return
          end
          top_users = ClickHouseQueries::Event::TopUsers::List.new(
            public_keys_for_requested_data_source, 
            event_name: params[:event_name],
            start_time: start_timestamp,
            end_time: end_timestamp,
            limit: params[:limit] || 10
          ).get
          render json: top_users, status: :ok
        end
      end
    end
  end
end