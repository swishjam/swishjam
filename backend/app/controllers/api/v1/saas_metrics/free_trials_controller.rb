module Api
  module V1
    module SaasMetrics
      class FreeTrialsController < BaseController
        include TimeseriesHelper

        def timeseries
          params[:data_source] = ApiKey::ReservedDataSources.STRIPE
          if public_keys_for_requested_data_source.empty?
            render json: { timeseries: [], error: 'Stripe is not configured for this account' }, status: :not_found
            return
          end
          timeseries = ClickHouseQueries::Events::Timeseries.new(
            public_keys_for_requested_data_source,
            event: StripeHelpers::SupplementalEvents::NewFreeTrial.EVENT_NAME,
            start_time: start_timestamp,
            end_time: end_timestamp,
          ).get
          comparison_timeseries = nil
          if params[:exclude_comparison].nil? || params[:exclude_comparison] != "true"
            comparison_timeseries = ClickHouseQueries::Events::Timeseries.new(
              public_keys_for_requested_data_source,
              event: StripeHelpers::SupplementalEvents::NewFreeTrial.EVENT_NAME,
              start_time: comparison_start_timestamp,
              end_time: comparison_end_timestamp,
            ).get
          end
          render json: render_timeseries_json(timeseries, comparison_timeseries), status: :ok
        end
      end
    end
  end
end