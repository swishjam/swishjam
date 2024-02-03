module Api
  module V1
    module Users
      class SessionsController < BaseController
        include TimeseriesHelper

        def timeseries
          params[:data_source] ||= 'all'
          timeseries = ClickHouseQueries::Events::Timeseries.new(
            public_keys_for_requested_data_source,
            workspace_id: current_workspace.id,
            event: ClickHouseQueries::Events::Timeseries.ANY_EVENT,
            start_time: start_timestamp,
            end_time: end_timestamp,
            user_profile_id: @user.id,
            distinct_count_property: Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER,
          ).get
          render json: render_timeseries_json(timeseries), status: :ok
        end
      end
    end
  end
end