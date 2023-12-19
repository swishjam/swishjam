module Api
  module V1
    module SaasMetrics
      class MrrMovementController < BaseController
        def stacked_bar_chart
          params[:data_source] = ApiKey::ReservedDataSources.STRIPE
          data = ClickHouseQueries::SaasMetrics::Mrr::Movement::StackedBarChart.new(
            public_keys_for_requested_data_source,
            start_time: start_timestamp,
            end_time: end_timestamp,
          ).get
          render json: data, status: :ok
        end
      end
    end
  end
end