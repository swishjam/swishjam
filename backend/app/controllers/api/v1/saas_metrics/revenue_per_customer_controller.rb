module Api
  module V1
    module SaasMetrics
      class RevenuePerCustomerController < BaseController
        include TimeseriesHelper

        def index
          params[:data_source] = ApiKey::ReservedDataSources.STRIPE
          timeseries = ClickHouseQueries::SaasMetrics::RevenuePerCustomer.new(
            public_keys_for_requested_data_source,
            start_time: start_timestamp,
            end_time: end_timestamp
          ).timeseries
          comparison_timeseries = nil
          if params[:exclude_comparison].nil? || params[:exclude_comparison] != "true"
            comparison_timeseries = ClickHouseQueries::SaasMetrics::RevenuePerCustomer.new(
              public_keys_for_requested_data_source,
              start_time: comparison_start_timestamp,
              end_time: comparison_end_timestamp
            ).timeseries
          end
          render json: render_timeseries_json(timeseries, comparison_timeseries), status: :ok
        end
      end
    end
  end
end