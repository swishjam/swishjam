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
        total_mrr += calc_mrr_for_subscription(subscription)
        total_active_subscriptions += 1 if subscription.status == 'active'
        total_free_trial_subscriptions += 1 if subscription.status == 'trialing'
        total_canceled_subscriptions += 1 if subscription.status == 'canceled'
      end

      @instance.billing_data_snapshots.create!(
        mrr_in_cents: total_mrr,
        total_revenue_in_cents: calculate_total_revenue,
        num_active_subscriptions: total_active_subscriptions,
        num_free_trial_subscriptions: total_free_trial_subscriptions,
        num_canceled_subscriptions: total_canceled_subscriptions,
        captured_at: Time.current
      )
    end

    private

    def get_all_subscriptions(subscriptions: [], starting_after: nil)
      response = ::Stripe::Subscription.list({ starting_after: starting_after, expand: ['data.customer'] }, stripe_account: @stripe_account_id)
      subscriptions += response.data
      return subscriptions unless response.has_more
      get_all_subscriptions(subscriptions: subscriptions, starting_after: response.data.last.id)
    end

    def get_all_charges(charges: [], starting_after: nil)
      response = ::Stripe::Charge.list({ starting_after: starting_after }, stripe_account: @stripe_account_id)
      charges += response.data
      return charges unless response.has_more
      get_all_charges(charges: charges, starting_after: response.data.last.id)
    end

    def calculate_total_revenue
      total_revenue = 0
      get_all_charges.each do |charge|
        next unless charge.paid
        total_revenue += charge.amount
      end
      total_revenue
    end

    def calc_mrr_for_subscription(subscription)
      mrr = 0
      return mrr unless subscription.status == 'active'
      subscription.items.each do |subscription_item|
        case subscription_item.plan.interval
        when 'day'
          days_in_this_month = (Time.current.next_month.beginning_of_month - Time.current.beginning_of_month) / (60 * 60 * 24)
          mrr += subscription_item.plan.amount * subscription_item.quantity * days_in_this_month
        when 'month'
          mrr += subscription_item.plan.amount * subscription_item.quantity
        when 'year'
          mrr += subscription_item.plan.amount * subscription_item.quantity / 12
        else
          Rails.logger.error "Unknown interval: #{subscription_item.plan.interval}, cannot calculate MRR."
        end
      end
      mrr
    end
  end
end