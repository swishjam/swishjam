module Api
  module V1
    module Users
      class SessionsController < BaseController
        def timeseries
          url_hosts = current_workspace.url_segments.pluck(:url_host)
          querier = ClickHouseQueries::Users::Sessions::Timeseries.new(
            current_workspace.public_key, 
            @user.id, 
            url_hosts: url_hosts, 
            # start_time: start_timestamp, 
            start_time: 3.months.ago,
            end_time: end_timestamp
          )
          render json: { timeseries: querier.timeseries }, status: :ok
        end
      end
    end
  end
end