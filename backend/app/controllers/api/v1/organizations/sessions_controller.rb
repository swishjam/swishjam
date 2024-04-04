module Api
  module V1
    module Organizations
      class SessionsController < BaseController
        include TimeseriesHelper
        
        def timeseries
          params[:data_source] ||= 'all'
          timeseries = ClickHouseQueries::Events::Timeseries.new(
            public_keys_for_requested_data_source,
            event: ClickHouseQueries::Events::Timeseries.ANY_EVENT,
            start_time: start_timestamp,
            end_time: end_timestamp,
            organization_profile_id: @organization.id,
            distinct_count_property: Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER,
          ).get
          render json: render_timeseries_json(timeseries), status: :ok
        end
      end
    end
  end
end