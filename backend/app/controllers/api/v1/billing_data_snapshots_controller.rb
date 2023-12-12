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
          }, status: :ok
        else
          current_billing_data_getter = ClickHouseQueries::BillingDataSnapshots::Timeseries.new(public_keys_for_requested_data_source, start_time: start_timestamp, end_time: end_timestamp)
          comparison_billing_data_getter = ClickHouseQueries::BillingDataSnapshots::Timeseries.new(public_keys_for_requested_data_source, start_time: comparison_start_timestamp, end_time: comparison_end_timestamp)
          current_billing_data = current_billing_data_getter.get
          comparison_billing_data = comparison_billing_data_getter.get

          current_mrr_timeseries_data_formatter = DataFormatters::Timeseries.new(
            current_billing_data,
            start_time: current_billing_data_getter.start_time,
            end_time: current_billing_data_getter.end_time,
            group_by: current_billing_data_getter.group_by,
            value_method: :mrr_in_cents,
            date_method: :rounded_captured_at,
          )

          comparison_mrr_timeseries_data_formatter = DataFormatters::Timeseries.new(
            comparison_billing_data,
            start_time: comparison_billing_data_getter.start_time,
            end_time: comparison_billing_data_getter.end_time,
            group_by: comparison_billing_data_getter.group_by,
            value_method: :mrr_in_cents,
            date_method: :rounded_captured_at,
          )

          current_active_subscriptions_timeseries_data_formatter = DataFormatters::Timeseries.new(
            current_billing_data,
            start_time: current_billing_data_getter.start_time,
            end_time: current_billing_data_getter.end_time,
            group_by: current_billing_data_getter.group_by,
            value_method: :num_active_subscriptions,
            date_method: :rounded_captured_at,
          )

          comparison_active_subscriptions_timeseries_data_formatter = DataFormatters::Timeseries.new(
            comparison_billing_data,
            start_time: comparison_billing_data_getter.start_time,
            end_time: comparison_billing_data_getter.end_time,
            group_by: comparison_billing_data_getter.group_by,
            value_method: :num_active_subscriptions,
            date_method: :rounded_captured_at,
          )

          render json: {
            mrr: render_timeseries_json(current_mrr_timeseries_data_formatter, comparison_mrr_timeseries_data_formatter),
            active_subscriptions: render_timeseries_json(current_active_subscriptions_timeseries_data_formatter, comparison_active_subscriptions_timeseries_data_formatter),
            # current_mrr: current_mrr_timeseries_data_formatter.most_recent_value || 0
            # comparison_mrr: comparison_mrr_timeseries_data_formatter.most_recent_value || 0
            # current_mrr_timeseries: current_billing_data.map{ |data| { date: data.captured_at, value: data.mrr_in_cents }},
            # current_mrr_timeseries: current_mrr_timeseries_data_formatter.formatted_data,
            # comparison_mrr_timeseries: comparison_billing_data.map{ |data| { date: data.captured_at, value: data.mrr_in_cents }},
            # comparison_mrr_timeseries: comparison_mrr_timeseries_data_formatter.formatted_data,
            # current_num_active_subscriptions: current_billing_data.last&.num_active_subscriptions || 0,
            # comparison_num_active_subscriptions: comparison_billing_data.last&.num_active_subscriptions || 0,
            # current_num_active_subscriptions_timeseries: current_billing_data.map{ |data| { date: data.captured_at, value: data.num_active_subscriptions }},
            # comparison_num_active_subscriptions_timeseries: comparison_billing_data.map{ |data| { date: data.captured_at, value: data.num_active_subscriptions }},
            # current_total_revenue: current_billing_data.last&.total_revenue_in_cents || 0,
            # comparison_total_revenue: comparison_billing_data.last&.total_revenue_in_cents || 0,
            # current_total_revenue_timeseries: current_billing_data.map{ |data| { date: data.captured_at, value: data.total_revenue_in_cents }},
            # comparison_total_revenue_timeseries: comparison_billing_data.map{ |data| { date: data.captured_at, value: data.total_revenue_in_cents }},
            # current_num_free_trial_subscriptions: current_billing_data.last&.num_free_trial_subscriptions,
            # comparison_num_free_trial_subscriptions: comparison_billing_data.last&.num_free_trial_subscriptions,
            # change_in_num_free_trial_subscriptions: current_billing_data.last.present? && comparison_billing_data.last.present? ? current_billing_data.last.num_free_trial_subscriptions - comparison_billing_data.last.num_free_trial_subscriptions : nil,
            # current_num_free_trial_subscriptions_timeseries: current_billing_data.map{ |data| { date: data.captured_at, value: data.num_free_trial_subscriptions }},
            # comparison_num_free_trial_subscriptions_timeseries: comparison_billing_data.map { |data| { date: data.captured_at, value: data.num_free_trial_subscriptions }},
            # current_num_canceled_subscriptions: current_billing_data.last&.num_canceled_subscriptions,
            # comparison_num_canceled_subscriptions: comparison_billing_data.last&.num_canceled_subscriptions,
            # change_in_num_canceled_subscriptions: current_billing_data.last.present? && comparison_billing_data.present? ? current_billing_data.last.num_canceled_subscriptions - comparison_billing_data.last.num_canceled_subscriptions : 0,
            # current_num_canceled_subscriptions_timeseries: current_billing_data.map{ |data| { date: data.captured_at, value: data.num_canceled_subscriptions }},
            # comparison_num_canceled_subscriptions_timeseries: comparison_billing_data.map{ |data| { date: data.captured_at, value: data.num_canceled_subscriptions }},
            # start_time: current_billing_data_getter.start_time,
            # end_time: current_billing_data_getter.end_time,
            # comparison_start_time: comparison_billing_data_getter.start_time,
            # comparison_end_time: comparison_billing_data_getter.end_time,
            # grouped_by: current_billing_data_getter.group_by,
          }
        end
      end
    end
  end
end