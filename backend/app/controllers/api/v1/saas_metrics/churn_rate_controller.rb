module Api
  module V1
    module SaasMetrics
      class ChurnRateController < BaseController
        def timeseries
          api_key = current_workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.STRIPE)&.public_key
          if api_key
            timeseries = ClickHouseQueries::SaasMetrics::ChurnRate::Timeseries.new(
              api_key,
              start_time: start_timestamp,
              end_time: end_timestamp,
              num_days_in_churn_period: (params[:num_days_in_churn_period] || 30).to_i,
            ).get
            comparison_timeseries = nil
            if params[:include_comparison]
              comparison_timeseries = ClickHouseQueries::SaasMetrics::ChurnRate::Timeseries.new(
                api_key,
                start_time: comparison_start_timestamp,
                end_time: comparison_end_timestamp,
                num_days_in_churn_period: (params[:num_days_in_churn_period] || 30).to_i,
              ).get
            end
            render json: { timeseries: timeseries, comparison_timeseries: comparison_timeseries }, status: :ok
          else
            render json: {
              timeseries: [],
              error: "Stripe integration is not enabled for this workspace."
            }, status: :unprocessable_entity
          end
        end
      end
    end
  end
end