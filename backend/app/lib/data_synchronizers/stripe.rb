module DataSynchronizers
  class Stripe
    def initialize(workspace, stripe_account_id)
      @workspace = workspace
      @stripe_account_id = stripe_account_id
      @stripe_metrics = StripeHelpers::MetricsCalculator.new(stripe_account_id)
    end

    def sync!
      create_billing_data_snapshot!
    end

    private

    def create_billing_data_snapshot!
      Analytics::BillingDataSnapshot.create!(
        swishjam_api_key: @workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.STRIPE).public_key,
        mrr_in_cents: @stripe_metrics.mrr,
        total_revenue_in_cents: @stripe_metrics.total_revenue,
        num_active_subscriptions: @stripe_metrics.total_num_active_subscriptions,
        num_paid_subscriptions: @stripe_metrics.total_num_paid_subscriptions,
        num_free_trial_subscriptions: @stripe_metrics.total_num_free_trial_subscriptions,
        num_canceled_subscriptions: @stripe_metrics.total_num_canceled_subscriptions,
        num_customers_with_paid_subscriptions: @stripe_metrics.total_num_customers_with_paid_subscriptions,
        captured_at: Time.current
      )
    end
  end
end