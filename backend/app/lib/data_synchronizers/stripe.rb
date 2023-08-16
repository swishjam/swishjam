module DataSynchronizers
  class Stripe
    def initialize(swishjam_organization, stripe_account_id)
      @swishjam_organization = swishjam_organization
      @stripe_metrics = StripeHelpers::MetricsCalculator.new(stripe_account_id)
      @data_source_mapper = DataSourceMappers::Stripe.new(@swishjam_organization)
    end
    
    def sync!
      create_billing_data_snapshot!
      create_customer_billing_data_snapshots!
      create_or_update_customer_subscriptions!
      create_or_update_payments!
    end

    private

    def create_billing_data_snapshot!
      @swishjam_organization.analytics_billing_data_snapshots.create!(
        mrr_in_cents: @stripe_metrics.mrr,
        total_revenue_in_cents: @stripe_metrics.total_revenue,
        num_active_subscriptions: @stripe_metrics.total_active_subscriptions,
        num_free_trial_subscriptions: @stripe_metrics.total_free_trial_subscriptions,
        num_canceled_subscriptions: @stripe_metrics.total_canceled_subscriptions,
        captured_at: Time.current
      )
    end

    def create_customer_billing_data_snapshots!
      @stripe_metrics.subscriptions.each do |stripe_subscription|
        Analytics::CustomerBillingDataSnapshot.create!(
          swishjam_organization: @swishjam_organization,
          owner: DataSourceMappers::Stripe.try_to_find_subscription_owner(@swishjam_organization, stripe_subscription),
          customer_email: stripe_subscription.customer&.email,
          customer_name: stripe_subscription.customer&.name,
          mrr_in_cents: @stripe_metrics.mrr_for_subscription(stripe_subscription),
          total_revenue_in_cents: @stripe_metrics.revenue_for_subscription(stripe_subscription),
          captured_at: Time.current
        )
      end
    end

    def create_or_update_customer_subscriptions!
      @stripe_metrics.subscriptions.each do |stripe_subscription|
        existing_customer_subscription = Analytics::CustomerSubscription.find_by(swishjam_organization: @swishjam_organization, provider_id: stripe_subscription.id)
        if existing_customer_subscription
          existing_customer_subscription.update!(
            customer_email: stripe_subscription.customer.email,
            customer_name: stripe_subscription.customer.name,
            amount_in_cents: stripe_subscription.plan.amount,
            interval: stripe_subscription.plan.interval,
            plan_name: stripe_subscription.plan.product.name,
            status: stripe_subscription.status,
            started_at: Time.at(stripe_subscription.created),
            next_charge_runs_at: Time.at(stripe_subscription.current_period_end),
            ends_at: stripe_subscription.canceled_at ? Time.at(stripe_subscription.canceled_at) : nil,
            free_trial_starts_at: stripe_subscription.trial_start ? Time.at(stripe_subscription.trial_start) : nil,
            free_trial_ends_at: stripe_subscription.trial_end ? Time.at(stripe_subscription.trial_end) : nil
          )
        else
          Analytics::CustomerSubscription.create!(
            swishjam_organization: @swishjam_organization,
            payment_processor: 'stripe',
            provider_id: stripe_subscription.id,
            customer_email: stripe_subscription.customer.email,
            customer_name: stripe_subscription.customer.name,
            amount_in_cents: stripe_subscription.plan.amount,
            interval: stripe_subscription.plan.interval,
            plan_name: stripe_subscription.plan.product.name,
            status: stripe_subscription.status,
            started_at: Time.at(stripe_subscription.created),
            next_charge_runs_at: Time.at(stripe_subscription.current_period_end),
            ends_at: stripe_subscription.canceled_at ? Time.at(stripe_subscription.canceled_at) : nil,
            free_trial_starts_at: stripe_subscription.trial_start ? Time.at(stripe_subscription.trial_start) : nil,
            free_trial_ends_at: stripe_subscription.trial_end ? Time.at(stripe_subscription.trial_end) : nil
          )
        end
      end
    end

    def create_or_update_payments!
      @stripe_metrics.charges.each do |stripe_charge|
        existing_payment = @swishjam_organization.analytics_customer_payments.find_by(provider_id: stripe_charge.id)
        if existing_payment
          existing_payment.update!(
            provider_id: stripe_charge.id,
            customer_email: stripe_charge.customer&.email,
            customer_name: stripe_charge.customer&.name,
            amount_in_cents: charge.amount,
            charged_at: Time.at(stripe_charge.created),
            status: stripe_charge.status
          )
        else
          Analytics::CustomerPayment.create!(
            swishjam_organization: @swishjam_organization,
            payment_processor: 'stripe',
            provider_id: stripe_charge.id,
            customer_email: stripe_charge.customer&.email,
            customer_name: stripe_charge.customer&.name,
            amount_in_cents: stripe_charge.amount,
            charged_at: Time.at(stripe_charge.created),
            status: stripe_charge.status
          )
        end
      end
    end
  end
end