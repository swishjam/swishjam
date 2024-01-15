module Api
  module V1
    module SaasMetrics
      class RevenueController < BaseController
        include TimeseriesHelper

        def heatmap
          params[:data_source] = ApiKey::ReservedDataSources.STRIPE
          if public_keys_for_requested_data_source.empty?
            render json: { error: 'Stripe is not configured for this account' }, status: :not_found
            return
          end
          heatmap = ClickHouseQueries::Events::Sum::Timeseries.new(
            public_keys_for_requested_data_source,
            event_name: StripeHelpers::SupplementalEvents::ChargeSucceeded.EVENT_NAME,
            property: :amount_in_cents,
            start_time: 1.year.ago.beginning_of_week,
            end_time: Time.current,
            group_by: :day,
          ).get
          render json: heatmap.formatted_data, status: :ok
        end

        def timeseries
          params[:data_source] = ApiKey::ReservedDataSources.STRIPE
          if public_keys_for_requested_data_source.empty?
            render json: { timeseries: [], error: 'Stripe is not configured for this account' }, status: :not_found
            return
          end
          timeseries = ClickHouseQueries::Events::Sum::Timeseries.new(
            public_keys_for_requested_data_source,
            event_name: StripeHelpers::SupplementalEvents::ChargeSucceeded.EVENT_NAME,
            property: :amount_in_cents,
            start_time: start_timestamp,
            end_time: end_timestamp,
          ).get
          comparison_timeseries = nil
          if params[:exclude_comparison].nil? || params[:exclude_comparison] != "true"
            comparison_timeseries = ClickHouseQueries::Events::Sum::Timeseries.new(
              public_keys_for_requested_data_source,
              event_name: StripeHelpers::SupplementalEvents::ChargeSucceeded.EVENT_NAME,
              property: :amount_in_cents,
              start_time: comparison_start_timestamp,
              end_time: comparison_end_timestamp,
            ).get
          end
          render json: render_timeseries_json(timeseries, comparison_timeseries), status: :ok
        end

        def retention
          starting_cohort_date = (params[:num_cohorts] || 8).to_i.months.ago.beginning_of_month
          retention_data = RevenueRetention::Getter.new(current_workspace.id, starting_cohort_date: starting_cohort_date).get
          render json: retention_data, status: :ok
        end

        def per_customer_timeseries
          params[:data_source] = ApiKey::ReservedDataSources.STRIPE
          if public_keys_for_requested_data_source.empty?
            render json: { timeseries: [], error: 'Stripe is not configured for this account' }, status: :not_found
            return
          end
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