module StripeHelpers
  class MetricsCalculator
    def initialize(stripe_account_id)
      @stripe_account_id = stripe_account_id
      @subscription_mrr_map = {}
      @subscription_revenue_map = {}
    end

    def subscriptions
      @stripe_subscriptions ||= StripeHelpers::DataFetchers.get_all_subscriptions(@stripe_account_id)
    end

    def charges
      @stripe_charges ||= StripeHelpers::DataFetchers.get_all_charges(@stripe_account_id)
    end

    def flush_cache!
      @stripe_subscriptions = nil
      @stripe_charges = nil
      @total_mrr = nil
      @total_revenue = nil
      @total_num_active_subscriptions = nil
      @total_num_paid_subscriptions = nil
      @total_num_free_trial_subscriptions = nil
      @total_num_canceled_subscriptions = nil
      @subscription_mrr_map = {}
      @subscription_revenue_map = {}
    end

    def mrr
      return @total_mrr if @total_mrr.present?
      calculate_mrr_and_subscription_counts
      @total_mrr
    end
    alias total_mrr mrr

    def revenue
      return @total_revenue if @total_revenue.present?
      calculate_total_revenue
    end
    alias total_revenue revenue

    def mrr_for_subscription(subscription)
      return @subscription_mrr_map[subscription.id] if @subscription_mrr_map[subscription.id].present?
      @subscription_mrr_map[subscription.id] = calculate_mrr_for_subscription(subscription)
    end
    alias total_mrr_for_subscription mrr_for_subscription

    def revenue_for_subscription(subscription)
      return @subscription_revenue_map[subscription.id] if @subscription_revenue_map[subscription.id].present?
      @subscription_revenue_map[subscription.id] = calculate_total_revenue_for_subscription(subscription)
    end
    alias total_revenue_for_subscription revenue_for_subscription

    def total_num_active_subscriptions
      return @total_num_active_subscriptions if @total_num_active_subscriptions.present?
      calculate_mrr_and_subscription_counts
      @total_num_active_subscriptions
    end
    alias num_active_subscriptions total_num_active_subscriptions

    def total_num_paid_subscriptions
      return @total_num_paid_subscriptions if @total_num_paid_subscriptions.present?
      calculate_mrr_and_subscription_counts
      @total_num_paid_subscriptions
    end

    def total_num_free_trial_subscriptions
      return @total_num_free_trial_subscriptions if @total_num_free_trial_subscriptions.present?
      calculate_mrr_and_subscription_counts
      @total_num_free_trial_subscriptions
    end
    alias num_free_trial_subscriptions total_num_free_trial_subscriptions

    def total_num_canceled_subscriptions
      return @total_num_canceled_subscriptions if @total_num_canceled_subscriptions.present?
      calculate_mrr_and_subscription_counts
      @total_num_canceled_subscriptions
    end
    alias num_canceled_subscriptions total_num_canceled_subscriptions

    private

    def calculate_mrr_and_subscription_counts
      @total_mrr = 0
      @total_num_active_subscriptions = 0
      @total_num_free_trial_subscriptions = 0
      @total_num_canceled_subscriptions = 0
      @total_num_paid_subscriptions = 0
      subscriptions.each do |subscription|
        @total_mrr += calculate_mrr_for_subscription(subscription)
        @total_num_active_subscriptions += 1 if subscription.status == 'active'
        @total_num_free_trial_subscriptions += 1 if subscription.status == 'trialing'
        @total_num_canceled_subscriptions += 1 if subscription.status == 'canceled'
        @total_num_paid_subscriptions += 1 if subscription.status == 'active' && subscription.items.sum{ |item| item.price.unit_amount * item.quantity } > 0
      end
    end

    def calculate_total_revenue
      @total_revenue = 0
      charges.each do |charge| 
        next if charge.status != 'succeeded'
        @total_revenue += charge.amount - charge.amount_refunded
      end
      @total_revenue
    end

    def calculate_total_revenue_for_subscription(subscription)
      invoices_for_subscription = StripeHelpers::DataFetchers.get_all_invoices_for_subscription(@stripe_account_id, subscription.id)
      invoices_for_subscription.sum(&:amount_paid)
    end

    def calculate_mrr_for_subscription(subscription)
      @subscription_mrr_map[subscription.id] = 0
      # an active subscription that is set to be cancelled at the end of the billing period should not be counted towards MRR
      return 0 unless subscription.status == 'active' && subscription.canceled_at.nil?
      subscription.items.each do |subscription_item|
        case subscription_item.price.recurring.interval
        when 'day'
          num_days_in_this_month = (Time.current.next_month.beginning_of_month - Time.current.beginning_of_month) / (60 * 60 * 24)
          @subscription_mrr_map[subscription.id] += subscription_item.price.unit_amount * subscription_item.quantity * num_days_in_this_month
        when 'month'
          @subscription_mrr_map[subscription.id] += subscription_item.price.unit_amount * subscription_item.quantity
        when 'year'
          @subscription_mrr_map[subscription.id] += subscription_item.price.unit_amount * subscription_item.quantity / 12
        else
          raise "Unknown interval: #{subscription_item.price.recurring.interval}, cannot calculate MRR."
        end
      end
      @subscription_mrr_map[subscription.id]
    end
  end
end