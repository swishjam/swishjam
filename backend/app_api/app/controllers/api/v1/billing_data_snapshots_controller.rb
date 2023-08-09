module Api
  module V1
    class BillingDataSnapshotsController < BaseController
      def get
        current_billing_data = get_billing_data(30.days.ago.beginning_of_day, Time.current)
        comparison_billing_data = get_billing_data(60.days.ago.beginning_of_day, 30.days.ago.beginning_of_day)
        render json: {
          current_mrr: current_billing_data.first.mrr_in_cents,
          current_mrr_timeseries: current_billing_data.map{ |data| { data.captured_at => data.mrr_in_cents }},
          comparison_mrr_timeseries: comparison_billing_data.map{ |data| { data.captured_at => data.mrr_in_cents }},
          current_total_revenue: current_billing_data.first.total_revenue_in_cents,
          current_total_revenue_timeseries: current_billing_data.map{ |data| { data.captured_at => data.total_revenue_in_cents }},
          comparison_total_revenue_timeseries: comparison_billing_data.map{ |data| { data.captured_at => data.total_revenue_in_cents }},
          current_num_active_subscriptions: current_billing_data.first.num_active_subscriptions,
          current_num_active_subscriptions_timeseries: current_billing_data.map{ |data| { data.captured_at => data.num_active_subscriptions }},
          comparison_num_active_subscriptions_timeseries: comparison_billing_data.map{ |data| { data.captured_at => data.num_active_subscriptions }},
          current_num_free_trial_subscriptions: current_billing_data.first.num_free_trial_subscriptions,
          current_num_free_trial_subscriptions_timeseries: current_billing_data.map{ |data| { data.captured_at => data.num_free_trial_subscriptions }},
          comparison_num_free_trial_subscriptions_timeseries: comparison_billing_data.map { |data| { data.captured_at => data.num_free_trial_subscriptions }},
          current_num_canceled_subscriptions: current_billing_data.first.num_canceled_subscriptions,
          current_num_canceled_subscriptions_timeseries: current_billing_data.map{ |data| { data.captured_at => data.num_canceled_subscriptions }},
          comparison_num_canceled_subscriptions_timeseries: comparison_billing_data.map{ |data| { data.captured_at => data.num_canceled_subscriptions }},
          start_time: 30.days.ago.beginning_of_day,
          end_time: Time.current,
          comparison_start_time: 60.days.ago.beginning_of_day,
          comparison_end_time: 30.days.ago.beginning_of_day,
        }
      end

      private
      
      def get_billing_data(start_time, end_time)
        instance.billing_data_snapshots
                  .where(captured_at: start_time..end_time)
                  .order(captured_at: :desc)
                  .select(:mrr_in_cents, :total_revenue_in_cents, :num_active_subscriptions, :num_free_trial_subscriptions, :num_canceled_subscriptions, :captured_at)
      end
    end
  end
end