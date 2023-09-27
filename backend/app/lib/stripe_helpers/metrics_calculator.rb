module StripeHelpers
  class MetricsCalculator
    def initialize(stripe_account_id, start_date:, end_date: Time.current)
      @stripe_account_id = stripe_account_id
      @subscription_mrr_map = {}
      @subscription_revenue_map = {}
      @start_date = start_date
      @end_date = end_date
    end

    def subscriptions
      @stripe_subscriptions ||= StripeHelpers::DataFetchers.get_all_subscriptions(@stripe_account_id)
    end

    def charges
      @stripe_charges ||= StripeHelpers::DataFetchers.get_all_charges(@stripe_account_id)
    end

    def all_events_for_time_period
      @events ||= StripeHelpers::DataFetchers.get_all_events(
        @stripe_account_id, 
        %w[
          customer.created 
          customer.subscription.updated 
          customer.subscription.created 
          customer.subscription.deleted 
          customer.susbcription.paused 
          customer.susbcription.resumed
        ],
        created_after: @start_date
      )
    end

    def flush_cache!
      @stripe_subscriptions = nil
      @stripe_charges = nil
      @mrr = nil

      @total_revenue = nil
      @total_num_active_subscriptions = nil
      @total_num_paid_subscriptions = nil
      @total_num_free_trial_subscriptions = nil
      @total_num_canceled_subscriptions = nil
      
      @num_new_customers_for_time_period = nil
      @num_new_subscriptions_for_time_period = nil
      @num_new_paid_subscriptions_for_time_period = nil
      @num_new_free_trial_subscriptions_for_time_period = nil
      @num_downgraded_subscriptions_for_time_period = nil
      @num_upgraded_subscriptions_for_time_period = nil
      @num_canceled_subscriptions_for_time_period = nil
      @num_canceled_paid_subscriptions_for_time_period = nil
      @num_paused_subscriptions_for_time_period = nil
      @num_resumed_subscriptions_for_time_period = nil

      @upgraded_mrr_amount_in_cents_for_time_period = nil
      @downgraded_mrr_amount_in_cents_for_time_period = nil
      @churned_mrr_amount_in_cents_for_time_period = nil

      @subscription_mrr_map = {}
      @subscription_revenue_map = {}
    end

    def current_mrr
      return @total_mrr if @total_mrr.present?
      calculate_mrr_and_subscription_counts
      @total_mrr
    end

    def total_revenue
      return @total_revenue if @total_revenue.present?
      calculate_total_revenue
    end

    def mrr_for_subscription(subscription)
      return @subscription_mrr_map[subscription.id] if @subscription_mrr_map[subscription.id].present?
      @subscription_mrr_map[subscription.id] = calculate_mrr_for_subscription(subscription)
    end

    def total_revenue_for_subscription(subscription)
      return @subscription_revenue_map[subscription.id] if @subscription_revenue_map[subscription.id].present?
      @subscription_revenue_map[subscription.id] = calculate_total_revenue_for_subscription(subscription)
    end

    def total_num_active_subscriptions
      return @total_num_active_subscriptions if @total_num_active_subscriptions.present?
      calculate_mrr_and_subscription_counts
      @total_num_active_subscriptions
    end

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

    def total_num_canceled_subscriptions
      return @total_num_canceled_subscriptions if @total_num_canceled_subscriptions.present?
      calculate_mrr_and_subscription_counts
      @total_num_canceled_subscriptions
    end

    def num_new_customers_for_time_period
      return @num_new_customers_for_time_period if @num_new_customers_for_time_period.present?
      calculate_num_new_customers_for_time_period
      @num_new_customers_for_time_period
    end

    def num_new_subscriptions_for_time_period
      return @num_new_subscriptions_for_time_period if @num_new_subscriptions_for_time_period.present?
      calculate_subscription_data_for_time_period
      @num_new_subscriptions_for_time_period
    end

    def num_new_paid_subscriptions_for_time_period
      return @num_new_paid_subscriptions_for_time_period if @num_new_paid_subscriptions_for_time_period.present?
      calculate_subscription_data_for_time_period
      @num_new_paid_subscriptions_for_time_period
    end

    def num_new_free_trial_subscriptions_for_time_period
      return @num_new_free_trial_subscriptions_for_time_period if @num_new_free_trial_subscriptions_for_time_period.present?
      calculate_subscription_data_for_time_period
      @num_new_free_trial_subscriptions_for_time_period
    end

    def num_downgraded_subscriptions_for_time_period
      return @num_downgraded_subscriptions_for_time_period if @num_downgraded_subscriptions_for_time_period.present?
      calculate_subscription_data_for_time_period
      @num_downgraded_subscriptions_for_time_period
    end

    def num_upgraded_subscriptions_for_time_period
      return @num_upgraded_subscriptions_for_time_period if @num_upgraded_subscriptions_for_time_period.present?
      calculate_subscription_data_for_time_period
      @num_upgraded_subscriptions_for_time_period
    end

    def num_canceled_subscriptions_for_time_period
      return @num_canceled_subscriptions_for_time_period if @num_canceled_subscriptions_for_time_period.present?
      calculate_subscription_data_for_time_period
      @num_canceled_subscriptions_for_time_period
    end

    def num_canceled_paid_subscriptions_for_time_period
      return @num_canceled_paid_subscriptions_for_time_period if @num_canceled_paid_subscriptions_for_time_period.present?
      calculate_subscription_data_for_time_period
      @num_canceled_paid_subscriptions_for_time_period
    end

    def num_paused_subscriptions_for_time_period
      return @num_paused_subscriptions_for_time_period if @num_paused_subscriptions_for_time_period.present?
      calculate_subscription_data_for_time_period
      @num_paused_subscriptions_for_time_period
    end

    def num_resumed_subscriptions_for_time_period
      return @num_resumed_subscriptions_for_time_period if @num_resumed_subscriptions_for_time_period.present?
      calculate_subscription_data_for_time_period
      @num_resumed_subscriptions_for_time_period
    end

    def upgraded_mrr_amount_in_cents_for_time_period
      return @upgraded_mrr_amount_in_cents_for_time_period if @upgraded_mrr_amount_in_cents_for_time_period.present?
      calculate_subscription_data_for_time_period
      @upgraded_mrr_amount_in_cents_for_time_period
    end
    
    def downgraded_mrr_amount_in_cents_for_time_period
      return @downgraded_mrr_amount_in_cents_for_time_period if @downgraded_mrr_amount_in_cents_for_time_period.present?
      calculate_subscription_data_for_time_period
      @downgraded_mrr_amount_in_cents_for_time_period
    end

    def churned_mrr_amount_in_cents_for_time_period
      return @churned_mrr_amount_in_cents_for_time_period if @churned_mrr_amount_in_cents_for_time_period.present?
      calculate_subscription_data_for_time_period
      @churned_mrr_amount_in_cents_for_time_period
    end

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
        @total_revenue += charge.amount if charge.status == 'succeeded'
      end
      @total_revenue
    end

    def calculate_total_revenue_for_subscription(subscription)
      invoices_for_subscription = StripeHelpers::DataFetchers.get_all_invoices_for_subscription(@stripe_account_id, subscription.id)
      invoices_for_subscription.sum(&:amount_paid)
    end

    def calculate_mrr_for_subscription(subscription, allow_inactive_subscriptions: false)
      @subscription_mrr_map[subscription.id] = 0
      return 0 if subscription.status != 'active' && !allow_inactive_subscriptions
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
      if allow_inactive_subscriptions
        amount = @subscription_mrr_map[subscription.id]
        @subscription_mrr_map[subscription.id] = nil
        amount
      else
        @subscription_mrr_map[subscription.id]
      end
    end

    def calculate_num_new_customers_for_time_period
      @num_new_customers_for_time_period = 0
      all_events_for_time_period.each do |event|
        next unless event.type == 'customer.created'
        @num_new_customers_for_time_period += 1
      end
      @num_new_customers_for_time_period
    end

    def calculate_subscription_data_for_time_period
      @num_new_subscriptions_for_time_period = 0
      @num_new_paid_subscriptions_for_time_period = 0
      @num_new_free_trial_subscriptions_for_time_period = 0
      @num_downgraded_subscriptions_for_time_period = 0
      @num_upgraded_subscriptions_for_time_period = 0
      @num_canceled_subscriptions_for_time_period = 0
      @num_canceled_paid_subscriptions_for_time_period = 0
      @num_paused_subscriptions_for_time_period = 0
      @num_paused_paid_subscriptions_for_time_period = 0
      @num_resumed_subscriptions_for_time_period = 0
      @num_resumed_paid_subscriptions_for_time_period = 0

      @upgraded_mrr_amount_in_cents_for_time_period = 0
      @downgraded_mrr_amount_in_cents_for_time_period = 0
      @churned_mrr_amount_in_cents_for_time_period = 0

      all_events_for_time_period.each do |event|
        case event.type
        when 'customer.subscription.created'
          @num_new_subscriptions_for_time_period += 1
        
          if event.data.object.status == 'trialing'
            @num_new_free_trial_subscriptions_for_time_period += 1

          elsif event.data.object.status == 'active' && calculate_mrr_for_subscription(event.data.object, allow_inactive_subscriptions: true) > 0
            @num_new_paid_subscriptions_for_time_period += 1
          end
        when 'customer.subscription.resumed'
          @num_resumed_subscriptions_for_time_period += 1
          # if the resumed subscription was paid, also count it as a resumed paid subscription
          if calculate_mrr_for_subscription(event.data.object, allow_inactive_subscriptions: true) > 0
            @num_resumed_paid_subscriptions_for_time_period += 1
          end
        when 'customer.subscription.paused'
          @num_paused_subscriptions_for_time_period += 1
          # if the paused subscription was paid, also count it as a paused paid subscription
          if calculate_mrr_for_subscription(event.data.object, allow_inactive_subscriptions: true) > 0
            @num_paused_paid_subscriptions_for_time_period += 1
          end
        when 'customer.subscription.updated'
          # if a subscription moved from any status besides trialing to trialing, it's a new free trial
          if event.data.previous_attributes['status'] && event.data.previous_attributes['status'] != 'trialing' && event.data.object.status == 'trialing'
            @num_new_free_trial_subscriptions_for_time_period += 1
          end

          # if a subscription moved from any status to active and it has an amount above 0, it's a new paid subscription
          if event.data.previous_attributes['status'] && event.data.previous_attributes['status'] != 'active' && event.data.object.status == 'active' && mrr_for_subscription(event.data.object) > 0
            @num_new_paid_subscriptions_for_time_period += 1
          end

          # if a subscription moved from any status to canceled, it's a new canceled subscription
          # if it was paid, also count it is a new canceled paid subscription, and add the amount to the churned amount
          if event.data.previous_attributes['status'] && event.data.previous_attributes['status'] != 'canceled' && event.data.object.status == 'canceled'
            @num_canceled_subscriptions_for_time_period += 1
            if calculate_mrr_for_subscription(event.data.object, allow_inactive_subscriptions: true) > 0
              @num_canceled_paid_subscriptions_for_time_period += 1
              @churned_mrr_amount_in_cents_for_time_period += calculate_mrr_for_subscription(event.data.object, allow_inactive_subscriptions: true)
            end
          end

          # if the items in the subscription have changed, calculate the upgraded or downgraded amount
          if event.data.previous_attributes['items']
            previous_total = event.data.previous_attributes['items'].data.sum{ |item| item.price.unit_amount * item.quantity }
            change_in_amount = calculate_mrr_for_subscription(event.data.object, allow_inactive_subscriptions: true) - previous_total
            if change_in_amount > 0
              @num_upgraded_subscriptions_for_time_period += 1
              @upgraded_mrr_amount_in_cents_for_time_period += change_in_amount
            elsif change_in_amount < 0
              @num_downgraded_subscriptions_for_time_period += 1
              @downgraded_mrr_amount_in_cents_for_time_period += change_in_amount
            end
          end
        end
      end
    end
  end
end