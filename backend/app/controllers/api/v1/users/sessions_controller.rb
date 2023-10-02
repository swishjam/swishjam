module Api
  module V1
    module Users
      class SessionsController < BaseController
        def timeseries
          params[:data_source] ||= 'all'
          timeseries = ClickHouseQueries::Users::Sessions::Timeseries.new(
            public_keys_for_requested_data_source,
            user_profile_id: @user.id, 
            start_time: start_timestamp, 
            end_time: end_timestamp,
          ).timeseries
          render json: { timeseries: timeseries.formatted_data }, status: :ok
        end
      end
    end
  end
end