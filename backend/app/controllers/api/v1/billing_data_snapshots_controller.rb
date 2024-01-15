module Api
  module V1
    class BillingDataSnapshotsController < BaseController
      include TimeseriesHelper

      def index
        params[:data_source] = ApiKey::ReservedDataSources.STRIPE
        current_billing_data_getter = nil
        comparison_billing_data_getter = nil
        # a crappy hack to generate the correctly formatted data when Stripe is not connected.
        if !public_keys_for_requested_data_source || public_keys_for_requested_data_source.empty?
          render json: {
            mrr: {
              timeseries: [],
              current_count: 0,
              total_count: 0,
              comparison_timeseries: [],
              comparison_count: 0,
              comparison_total_count: 0,
            },
            active_subscriptions: {
              timeseries: [],
              current_count: 0,
              total_count: 0,
              comparison_timeseries: [],
              comparison_count: 0,
              comparison_total_count: 0,
            },
            customers_with_paid_subscriptions: {
              timeseries: [],
              current_count: 0,
              total_count: 0,
              comparison_timeseries: [],
              comparison_count: 0,
              comparison_total_count: 0,
            }
          }, status: :ok
        else
          current_billing_data_getter = ClickHouseQueries::BillingDataSnapshots::Timeseries.new(
            public_keys_for_requested_data_source, 
            columns: %i[mrr_in_cents num_active_subscriptions num_customers_with_paid_subscriptions],
            start_time: start_timestamp, 
            end_time: end_timestamp
          )
          comparison_billing_data_getter = ClickHouseQueries::BillingDataSnapshots::Timeseries.new(
            public_keys_for_requested_data_source, 
            columns: %i[mrr_in_cents num_active_subscriptions num_customers_with_paid_subscriptions],
            start_time: comparison_start_timestamp, 
            end_time: comparison_end_timestamp
          )

          render json: {
            mrr: render_timeseries_json(
              json_for_billing_data_results_attribute(current_billing_data_getter, :mrr_in_cents),
              json_for_billing_data_results_attribute(comparison_billing_data_getter, :mrr_in_cents),
            ),
            active_subscriptions: render_timeseries_json(
              json_for_billing_data_results_attribute(current_billing_data_getter, :num_active_subscriptions),
              json_for_billing_data_results_attribute(comparison_billing_data_getter, :num_active_subscriptions),
            ),
            customers_with_paid_subscriptions: render_timeseries_json(
              json_for_billing_data_results_attribute(current_billing_data_getter, :num_customers_with_paid_subscriptions),
              json_for_billing_data_results_attribute(comparison_billing_data_getter, :num_customers_with_paid_subscriptions),
            )
          }
        end
      end

      private

      def json_for_billing_data_results_attribute(billing_data_getter, attribute)
        DataFormatters::Timeseries.new(
          billing_data_getter.get,
          start_time: billing_data_getter.start_time,
          end_time: billing_data_getter.end_time,
          group_by: billing_data_getter.group_by,
          value_method: attribute,
          date_method: :rounded_captured_at,
          use_previous_value_for_missing_data: true,
        )
      end
    end
  end
end