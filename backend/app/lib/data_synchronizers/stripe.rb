module DataSynchronizers
  class Stripe
    def initialize(instance, stripe_account_id)
      @instance = instance
      @stripe_account_id = stripe_account_id
    end
    
    def sync!
      total_mrr = 0
      total_active_subscriptions = 0
      total_free_trial_subscriptions = 0
      total_canceled_subscriptions = 0

      get_all_subscriptions.each do |subscription|
        mrr_for_subscription = calc_mrr_for_subscription(subscription)
        total_mrr += mrr_for_subscription
        total_active_subscriptions += 1 if subscription.status == 'active'
        total_free_trial_subscriptions += 1 if subscription.status == 'trialing'
        total_canceled_subscriptions += 1 if subscription.status == 'canceled'

        create_or_update_customer_subscription(subscription)
        create_customer_billing_data_snapshot(subscription, mrr_for_subscription)
      end

      total_revenue = create_or_update_payments_and_calculate_total_revenue!

      @instance.billing_data_snapshots.create!(
        mrr_in_cents: total_mrr,
        total_revenue_in_cents: total_revenue,
        num_active_subscriptions: total_active_subscriptions,
        num_free_trial_subscriptions: total_free_trial_subscriptions,
        num_canceled_subscriptions: total_canceled_subscriptions,
        captured_at: Time.current
      )
    end

    private

    def get_all_subscriptions(subscriptions: [], starting_after: nil)
      response = ::Stripe::Subscription.list({ starting_after: starting_after, expand: ['data.customer', 'data.plan.product'] }, stripe_account: @stripe_account_id)
      subscriptions += response.data
      return subscriptions unless response.has_more
      get_all_subscriptions(subscriptions: subscriptions, starting_after: response.data.last.id)
    end

    def get_all_charges(charges: [], starting_after: nil)
      response = ::Stripe::Charge.list({ starting_after: starting_after, expand: ['data.customer'] }, stripe_account: @stripe_account_id)
      charges += response.data
      return charges unless response.has_more
      get_all_charges(charges: charges, starting_after: response.data.last.id)
    end

    def create_or_update_payments_and_calculate_total_revenue!
      total_revenue = 0
      get_all_charges.each do |charge|
        create_or_update_payment_from_charge(charge)
        next unless charge.paid
        total_revenue += charge.amount
      end
      total_revenue
    end

    def calc_mrr_for_subscription(subscription)
      mrr_for_subscription = 0
      if subscription.status == 'active'
        subscription.items.each do |subscription_item|
          case subscription_item.plan.interval
          when 'day'
            days_in_this_month = (Time.current.next_month.beginning_of_month - Time.current.beginning_of_month) / (60 * 60 * 24)
            mrr_for_subscription += subscription_item.plan.amount * subscription_item.quantity * days_in_this_month
          when 'month'
            mrr_for_subscription += subscription_item.plan.amount * subscription_item.quantity
          when 'year'
            mrr_for_subscription += subscription_item.plan.amount * subscription_item.quantity / 12
          else
            Rails.logger.error "Unknown interval: #{subscription_item.plan.interval}, cannot calculate MRR."
          end
        end
      end
      mrr_for_subscription
    end

    def create_or_update_payment_from_charge(charge)
      existing_payment = Analytics::Payment.find_by(instance: @instance, provider_id: charge.id)
      if existing_payment
        existing_payment.update!(
          provider_id: charge.id,
          customer_email: charge.customer&.email,
          customer_name: charge.customer&.name,
          amount_in_cents: charge.amount,
          charged_at: Time.at(charge.created),
          status: charge.status
        )
      else
        Analytics::Payment.create!(
          instance: @instance,
          payment_processor: 'stripe',
          provider_id: charge.id,
          customer_email: charge.customer&.email,
          customer_name: charge.customer&.name,
          amount_in_cents: charge.amount,
          charged_at: Time.at(charge.created),
          status: charge.status
        )
      end
    end
    
    def create_customer_billing_data_snapshot(subscription, mrr)
      invoices_for_subscription = ::Stripe::Invoice.list({ subscription: subscription.id }, stripe_account: @stripe_account_id)
      Analytics::CustomerBillingDataSnapshot.create!(
        instance: @instance,
        customer_email: subscription.customer&.email,
        customer_name: subscription.customer&.name,
        mrr_in_cents: mrr,
        total_revenue_in_cents: invoices_for_subscription.data.sum(&:amount_paid),
        captured_at: Time.current
      )
    end

    def create_or_update_customer_subscription(subscription)
      existing_customer_subscription = Analytics::CustomerSubscription.find_by(instance: @instance, provider_id: subscription.id)
      if existing_customer_subscription
        existing_customer_subscription.update!(
          customer_email: subscription.customer.email,
          customer_name: subscription.customer.name,
          amount_in_cents: subscription.plan.amount,
          interval: subscription.plan.interval,
          plan_name: subscription.plan.product.name,
          status: subscription.status,
          started_at: Time.at(subscription.created),
          next_charge_runs_at: Time.at(subscription.current_period_end),
          ends_at: subscription.canceled_at ? Time.at(subscription.canceled_at) : nil,
          free_trial_starts_at: subscription.trial_start ? Time.at(subscription.trial_start) : nil,
          free_trial_ends_at: subscription.trial_end ? Time.at(subscription.trial_end) : nil
        )
      else
        Analytics::CustomerSubscription.create!(
          instance: @instance,
          payment_processor: 'stripe',
          provider_id: subscription.id,
          customer_email: subscription.customer.email,
          customer_name: subscription.customer.name,
          amount_in_cents: subscription.plan.amount,
          interval: subscription.plan.interval,
          plan_name: subscription.plan.product.name,
          status: subscription.status,
          started_at: Time.at(subscription.created),
          next_charge_runs_at: Time.at(subscription.current_period_end),
          ends_at: subscription.canceled_at ? Time.at(subscription.canceled_at) : nil,
          free_trial_starts_at: subscription.trial_start ? Time.at(subscription.trial_start) : nil,
          free_trial_ends_at: subscription.trial_end ? Time.at(subscription.trial_end) : nil
        )
      end
    end
  end
end