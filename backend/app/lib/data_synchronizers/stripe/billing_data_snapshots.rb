module DataSynchronizers
  module Stripe
    class BillingDataSnapshots
      def self.create_new_snapshot!(swishjam_organization, stripe_subscriptions)
        total_mrr = 0
        total_active_subscriptions = 0
        total_free_trial_subscriptions = 0
        total_canceled_subscriptions = 0

        @stripe_subscriptions.each do |subscription|
          mrr_for_subscription = calc_mrr_for_subscription(subscription)
          total_mrr += mrr_for_subscription
          total_active_subscriptions += 1 if subscription.status == 'active'
          total_free_trial_subscriptions += 1 if subscription.status == 'trialing'
          total_canceled_subscriptions += 1 if subscription.status == 'canceled'

          create_or_update_customer_subscription(subscription)
          create_customer_billing_data_snapshot(subscription, mrr_for_subscription)
        end

        total_revenue = create_or_update_payments_and_calculate_total_revenue!

        @swishjam_organization.analytics_billing_data_snapshots.create!(
          mrr_in_cents: total_mrr,
          total_revenue_in_cents: total_revenue,
          num_active_subscriptions: total_active_subscriptions,
          num_free_trial_subscriptions: total_free_trial_subscriptions,
          num_canceled_subscriptions: total_canceled_subscriptions,
          captured_at: Time.current
        )
      end
    end
  end
end