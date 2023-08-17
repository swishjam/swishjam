module Api
  module V1
    class BillingDataSnapshotsController < BaseController
      def index
        current_billing_data = get_billing_data(30.days.ago.beginning_of_day, Time.current)
        comparison_billing_data = get_billing_data(60.days.ago.beginning_of_day, 30.days.ago.beginning_of_day)
        render json: {
          current_mrr: current_billing_data.last.mrr_in_cents,
          comparison_mrr: comparison_billing_data.last.mrr_in_cents,
          change_in_mrr: current_billing_data.last.mrr_in_cents - comparison_billing_data.last.mrr_in_cents,
          current_mrr_timeseries: current_billing_data.map{ |data| { date: data.captured_at, value: data.mrr_in_cents }},
          comparison_mrr_timeseries: comparison_billing_data.map{ |data| { date: data.captured_at, value: data.mrr_in_cents }},
          current_total_revenue: current_billing_data.last.total_revenue_in_cents,
          comparison_total_revenue: comparison_billing_data.last.total_revenue_in_cents,
          change_in_total_revenue: current_billing_data.last.total_revenue_in_cents - comparison_billing_data.last.total_revenue_in_cents,
          current_total_revenue_timeseries: current_billing_data.map{ |data| { date: data.captured_at, value: data.total_revenue_in_cents }},
          comparison_total_revenue_timeseries: comparison_billing_data.map{ |data| { date: data.captured_at, value: data.total_revenue_in_cents }},
          current_num_active_subscriptions: current_billing_data.last.num_active_subscriptions,
          comparison_num_active_subscriptions: comparison_billing_data.last.num_active_subscriptions,
          change_in_num_active_subscriptions: current_billing_data.last.num_active_subscriptions - comparison_billing_data.last.num_active_subscriptions,
          current_num_active_subscriptions_timeseries: current_billing_data.map{ |data| { date: data.captured_at, value: data.num_active_subscriptions }},
          comparison_num_active_subscriptions_timeseries: comparison_billing_data.map{ |data| { date: data.captured_at, value: data.num_active_subscriptions }},
          current_num_free_trial_subscriptions: current_billing_data.last.num_free_trial_subscriptions,
          comparison_num_free_trial_subscriptions: comparison_billing_data.last.num_free_trial_subscriptions,
          change_in_num_free_trial_subscriptions: current_billing_data.last.num_free_trial_subscriptions - comparison_billing_data.last.num_free_trial_subscriptions,
          current_num_free_trial_subscriptions_timeseries: current_billing_data.map{ |data| { date: data.captured_at, value: data.num_free_trial_subscriptions }},
          comparison_num_free_trial_subscriptions_timeseries: comparison_billing_data.map { |data| { date: data.captured_at, value: data.num_free_trial_subscriptions }},
          current_num_canceled_subscriptions: current_billing_data.last.num_canceled_subscriptions,
          comparison_num_canceled_subscriptions: comparison_billing_data.last.num_canceled_subscriptions,
          change_in_num_canceled_subscriptions: current_billing_data.last.num_canceled_subscriptions - comparison_billing_data.last.num_canceled_subscriptions,
          current_num_canceled_subscriptions_timeseries: current_billing_data.map{ |data| { date: data.captured_at, value: data.num_canceled_subscriptions }},
          comparison_num_canceled_subscriptions_timeseries: comparison_billing_data.map{ |data| { date: data.captured_at, value: data.num_canceled_subscriptions }},
          start_time: 30.days.ago.beginning_of_day,
          end_time: Time.current,
          comparison_start_time: 60.days.ago.beginning_of_day,
          comparison_end_time: 30.days.ago.beginning_of_day,
        }
      end

      private
      
      def get_billing_data(start_time, end_time)
        current_organization.analytics_billing_data_snapshots
                            .where(captured_at: start_time..end_time)
                            .order(captured_at: :asc)
                            .select(:mrr_in_cents, :total_revenue_in_cents, :num_active_subscriptions, :num_free_trial_subscriptions, :num_canceled_subscriptions, :captured_at)
      end
    end
  end
end