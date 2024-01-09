module Api
  module V1
    module Users
      class EventsController < BaseController
        def index
          limit = params[:limit] || 10
          params[:data_source] ||= 'all'
          events = ClickHouseQueries::Users::Events::List.new(
            public_keys_for_requested_data_source,
            user_profile: @user,
            limit: limit, 
            start_time: 1.year.ago,
            end_time: end_timestamp
          ).get
          render json: events, status: :ok
        end
      end
    end
  end
end