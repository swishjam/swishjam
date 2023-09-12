module Api
  module V1
    module Users
      class EventsController < BaseController
        def index
          limit = params[:limit] || 10
          events = ClickHouseQueries::Users::Events::List.new(
            current_workspace.public_key, 
            user_profile_id: @user.id, 
            limit: limit, 
            start_time: 1.year.ago,
            end_time: end_timestamp
          ).get
          render json: events, each_serializer: Analytics::EventSerializer, status: :ok
        end
      end
    end
  end
end