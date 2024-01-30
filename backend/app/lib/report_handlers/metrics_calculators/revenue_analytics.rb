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
    end
  end
end