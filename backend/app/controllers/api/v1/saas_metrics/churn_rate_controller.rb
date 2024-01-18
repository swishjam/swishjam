module Api
  module V1
    module SaasMetrics
      class ChurnRateController < BaseController
        include TimeseriesHelper

        def timeseries
          api_key = current_workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.STRIPE)&.public_key
          if api_key
            churn_rate_calculator = ChurnRateCalculator.new(
              api_key,
              start_time: start_timestamp,
              end_time: end_timestamp,
              num_days_in_churn_period: (params[:num_days_in_churn_period] || 30).to_i,
            )
            comparison_timeseries = nil
            if params[:exclude_comparison].nil? || params[:exclude_comparison] != "true"
              comparison_calculator = ChurnRateCalculator.new(
                api_key,
                start_time: comparison_start_timestamp,
                end_time: comparison_end_timestamp,
                num_days_in_churn_period: (params[:num_days_in_churn_period] || 30).to_i,
              )
            end
            render json: {
              timeseries: churn_rate_calculator.timeseries,
              comparison_timeseries: comparison_calculator&.timeseries,
              start_time: churn_rate_calculator.churn_period_start_time,
              end_time: churn_rate_calculator.churn_period_end_time,
              comparison_start_time: comparison_calculator&.churn_period_start_time,
              comparison_end_time: comparison_calculator&.churn_period_end_time,
              grouped_by: churn_rate_calculator.group_by,
            }, status: :ok
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