module ReportHandlers
  module MetricsCalculators
    class RevenueAnalytics < Base
      def new_mrr_for_period
        @new_mrr_for_period ||= sum_property_for_this_period(StripeHelpers::SupplementalEvents::NewActiveSubscription.EVENT_NAME, 'mrr')
      end

      def new_mrr_for_previous_period
        @new_mrr_for_previous_period ||= sum_property_for_previous_period(StripeHelpers::SupplementalEvents::NewActiveSubscription.EVENT_NAME, 'mrr')
      end

      def churned_mrr_for_period
        @churned_mrr_for_period ||= sum_property_for_this_period(StripeHelpers::SupplementalEvents::SubscriptionChurned.EVENT_NAME, 'mrr')
      end

      def churned_mrr_for_previous_period
        @churned_mrr_for_previous_period ||= sum_property_for_previous_period(StripeHelpers::SupplementalEvents::SubscriptionChurned.EVENT_NAME, 'mrr')
      end

      def num_new_subscriptions_for_period
        @num_new_subscriptions_for_period ||= event_count_for_this_period(StripeHelpers::SupplementalEvents::NewActiveSubscription.EVENT_NAME)
      end

      def num_new_subscriptions_for_previous_period
        @num_new_subscriptions_for_previous_period ||= event_count_for_previous_period(StripeHelpers::SupplementalEvents::NewActiveSubscription.EVENT_NAME)
      end

      def current_mrr
        @current_mrr ||= mrr_closest_to_date_without_going_over(current_period_end_date)
      end

      def mrr_for_previous_period
        @mrr_for_previous_period ||= mrr_closest_to_date_without_going_over(previous_period_end_date)
      end

      def mrr_closest_to_date_without_going_over(date)
        snapshot = nil
        mrr_snapshots_for_end_of_previous_period_to_end_of_current_period.each do |mrr_snapshot|
          break if mrr_snapshot['captured_at'].to_datetime > date.to_datetime
          snapshot = mrr_snapshot
        end
        snapshot['mrr_in_cents']
      end

      def mrr_snapshots_for_end_of_previous_period_to_end_of_current_period
        @billing_data_snapshots_for_end_of_previous_period_to_end_of_current_period ||= ClickHouseQueries::BillingDataSnapshots::List.new(
          public_key,
          columns: %i[mrr_in_cents],
          # a buffer just in case there isn't a snapshot for that exact time
          start_time: previous_period_end_date - 2.days, 
          end_time: current_period_end_date
        ).get
      end
    end
  end
end