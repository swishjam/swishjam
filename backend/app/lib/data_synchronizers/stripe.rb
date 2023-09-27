module DataSynchronizers
  class Stripe
    def initialize(workspace, stripe_account_id, start_date:, end_date: Time.current)
      @workspace = workspace
      @stripe_account_id = stripe_account_id
      @stripe_metrics = StripeHelpers::MetricsCalculator.new(stripe_account_id, start_date: start_date, end_date: end_date)
      @customer_profile_data_mapper = CustomerProfileDataMappers::Stripe.new(workspace)
      @start_date = start_date
      @end_date = end_date
    end
    
    def sync!
      create_billing_data_snapshot!
      # create_customer_billing_data_snapshots!
      # create_or_update_customer_subscriptions!
      # create_or_update_payments!
    end

    private

    def create_billing_data_snapshot!
      Analytics::BillingDataSnapshot.create!(
        swishjam_api_key: @workspace.public_key,
        start_time_period: @start_date,
        end_time_period: @end_date,
        mrr_in_cents: @stripe_metrics.current_mrr,
        total_revenue_in_cents: @stripe_metrics.total_revenue,
        num_active_subscriptions: @stripe_metrics.total_num_active_subscriptions,
        num_paid_subscriptions: @stripe_metrics.total_num_paid_subscriptions,
        num_free_trial_subscriptions: @stripe_metrics.total_num_free_trial_subscriptions,
        num_canceled_subscriptions: @stripe_metrics.total_num_canceled_subscriptions,
        num_new_customers_for_time_period: @stripe_metrics.num_new_customers_for_time_period,
        num_new_subscriptions_for_time_period: @stripe_metrics.num_new_subscriptions_for_time_period,
        num_new_paid_subscriptions_for_time_period: @stripe_metrics.num_new_paid_subscriptions_for_time_period,
        num_new_free_trial_subscriptions_for_time_period: @stripe_metrics.num_new_free_trial_subscriptions_for_time_period,
        num_downgraded_subscriptions_for_time_period: @stripe_metrics.num_downgraded_subscriptions_for_time_period,
        num_upgraded_subscriptions_for_time_period: @stripe_metrics.num_upgraded_subscriptions_for_time_period,
        num_canceled_subscriptions_for_time_period: @stripe_metrics.num_canceled_subscriptions_for_time_period,
        num_canceled_paid_subscriptions_for_time_period: @stripe_metrics.num_canceled_paid_subscriptions_for_time_period,
        num_paused_subscriptions_for_time_period: @stripe_metrics.num_paused_subscriptions_for_time_period,
        num_resumed_subscriptions_for_time_period: @stripe_metrics.num_resumed_subscriptions_for_time_period,
        upgraded_mrr_amount_in_cents_for_time_period: @stripe_metrics.upgraded_mrr_amount_in_cents_for_time_period,
        downgraded_mrr_amount_in_cents_for_time_period: @stripe_metrics.downgraded_mrr_amount_in_cents_for_time_period,
        churned_mrr_amount_in_cents_for_time_period: @stripe_metrics.churned_mrr_amount_in_cents_for_time_period,
        captured_at: Time.current
      )
    end

    def create_customer_billing_data_snapshots!
      @stripe_metrics.subscriptions.each do |stripe_subscription|
        Analytics::CustomerBillingDataSnapshot.create!(
          swishjam_api_key: @workspace.public_key,
          owner: @customer_profile_data_mapper.find_or_create_owner(stripe_subscription.customer),
          customer_email: stripe_subscription.customer&.email,
          customer_name: stripe_subscription.customer&.name,
          mrr_in_cents: @stripe_metrics.mrr_for_subscription(stripe_subscription),
          total_revenue_in_cents: @stripe_metrics.total_revenue_for_subscription(stripe_subscription),
          captured_at: Time.current
        )
      end
    end

    def create_or_update_customer_subscriptions!
      @stripe_metrics.subscriptions.each do |stripe_subscription|
        existing_customer_subscription = Analytics::CustomerSubscription.find_by(workspace: @workspace, provider_id: stripe_subscription.id)
        attrs = {
          owner: @customer_profile_data_mapper.find_or_create_owner(stripe_subscription.customer),
          provider_id: stripe_subscription.id,
          customer_email: stripe_subscription.customer.email,
          customer_name: stripe_subscription.customer.name,
          status: stripe_subscription.status,
          started_at: Time.at(stripe_subscription.created),
          next_charge_runs_at: Time.at(stripe_subscription.current_period_end),
          ends_at: stripe_subscription.canceled_at ? Time.at(stripe_subscription.canceled_at) : nil,
          free_trial_starts_at: stripe_subscription.trial_start ? Time.at(stripe_subscription.trial_start) : nil,
          free_trial_ends_at: stripe_subscription.trial_end ? Time.at(stripe_subscription.trial_end) : nil,
          subscription_items_attributes: stripe_subscription.items.map{ |stripe_subscription_item| {
            quantity: stripe_subscription_item.quantity,
            unit_amount_in_cents: stripe_subscription_item.price.unit_amount,
            interval: stripe_subscription_item.price.recurring.interval,
            plan_name: ::Stripe::Product.retrieve({ id: stripe_subscription_item.price.product }, stripe_account: @stripe_account_id).name
          }}
        }
        if existing_customer_subscription
          existing_customer_subscription.subscription_items.destroy_all
          existing_customer_subscription.update!(attrs)
        else
          @workspace.analytics_customer_subscriptions.create!(attrs)
        end
      end
    end

    def create_or_update_payments!
      @stripe_metrics.charges.each do |stripe_charge|
        existing_payment = @workspace.analytics_customer_payments.find_by(provider_id: stripe_charge.id)
        attrs = {
          owner: @customer_profile_data_mapper.find_or_create_owner(stripe_charge.customer),
          payment_processor: 'stripe',
          provider_id: stripe_charge.id,
          customer_email: stripe_charge.customer&.email,
          customer_name: stripe_charge.customer&.name,
          amount_in_cents: stripe_charge.amount,
          charged_at: Time.at(stripe_charge.created),
          status: stripe_charge.status
        }
        if existing_payment
          existing_payment.update!(attrs)
        else
          @workspace.analytics_customer_payments.create!(attrs)
        end
      end
    end
  end
end