module Api
  module V1
    module SaasMetrics
      class MrrController < BaseController
        def timeseries
          public_key = current_workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.STRIPE)&.public_key
          if public_key
            timeseries_getter = ClickHouseQueries::SaasMetrics::Mrr::Timeseries.new(
              public_key,
              start_time: start_timestamp, 
              end_time: end_timestamp,
            )
            comparison_timeseries_getter = ClickHouseQueries::SaasMetrics::Mrr::Timeseries.new(
              public_key,
              start_time: comparison_start_timestamp,
              end_time: comparison_end_timestamp,
            )
            render json: { 
              timeseries: timeseries_getter.get,
              comparison_timeseries: comparison_timeseries_getter.get,
              start_time: timeseries_getter.start_time,
              end_time: timeseries_getter.end_time,
              comparison_start_time: comparison_timeseries_getter.start_time,
              comparison_end_time: comparison_timeseries_getter.end_time,
              grouped_by: timeseries_getter.group_by,
              }, status: :ok
          else
            render json: { error: 'No Stripe API key found for this workspace' }, status: :unprocessable_entity
          end
        end
      end
    end
  end
end