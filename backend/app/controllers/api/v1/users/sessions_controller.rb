module Api
  module V1
    module Users
      class SessionsController < BaseController
        def timeseries
          analytics_family = params[:analytics_family] || 'product'
          if !['product', 'marketing'].include?(analytics_family)
            render json: { error: 'Invalid analytics_family' }, status: :bad_request
            return
          end
          timeseries = ClickHouseQueries::Users::Sessions::Timeseries.new(
            current_workspace.public_key, 
            @user.id, 
            # start_time: start_timestamp, 
            start_time: 3.months.ago,
            end_time: end_timestamp,
            analytics_family: analytics_family
          ).timeseries
          render json: { timeseries: timeseries.formatted_data }, status: :ok
        end
      end
    end
  end
end