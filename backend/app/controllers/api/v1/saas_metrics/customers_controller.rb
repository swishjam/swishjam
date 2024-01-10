module Api
  module V1
    module SaasMetrics
      class CustomersController < BaseController
        include TimeseriesHelper

        def timeseries
          params[:data_source] = ApiKey::ReservedDataSources.STRIPE
          timeseries = ClickHouseQueries::SaasMetrics::Customers.new(
            public_keys_for_requested_data_source,
            start_time: start_timestamp,
            end_time: end_timestamp,
          ).timeseries
          render json: render_timeseries_json(timeseries), status: :ok
        end
      end
    end
  end
end