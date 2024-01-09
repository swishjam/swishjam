module StripeHelpers
  class MrrCalculator
    def self.calculate_for_swishjam_subscription_record(subscription, include_canceled: false)
      return 0 unless subscription.status == 'active' && subscription.canceled_at.nil? ||
                          include_canceled && subscription.status == 'canceled' ||
                          include_canceled && subscription.canceled_at.present?
      subscription.customer_subscription_items.sum do |item|
        mrr_for_subscription_item(
          interval: item.price_recurring_interval,
          unit_amount: item.price_unit_amount,
          quantity: item.quantity,
          interval_count: item.price_recurring_interval_count
        )
      end
    end

    def self.calculate_for_stripe_subscription(subscription, include_canceled: false)
      mrr = 0
      return mrr unless subscription.status == 'active' && subscription.canceled_at.nil? || 
                          include_canceled && subscription.status == 'canceled' || 
                          include_canceled && subscription.canceled_at.present?
      subscription.items.each do |subscription_item|
        mrr += mrr_for_subscription_item(
          interval: subscription_item.price.recurring.interval,
          unit_amount: subscription_item.price.unit_amount,
          quantity: subscription_item.quantity,
          interval_count: subscription_item.price.recurring.interval_count
        )
      end
      mrr
    end

    def self.calculate_for_stripe_subscription_items(subscription_items)
      subscription_items.sum do |subscription_item|
        mrr_for_subscription_item(
          interval: subscription_item.price.recurring.interval,
          unit_amount: subscription_item.price.unit_amount,
          quantity: subscription_item.quantity,
          interval_count: subscription_item.price.recurring.interval_count
        )
      end
    end

    def self.mrr_for_subscription_item(interval:, unit_amount:, quantity:, interval_count:)
      case interval
      when 'day'
        unit_amount * quantity * (30.0 / interval_count)
      when 'week'
        unit_amount * quantity * (4.345 / interval_count)
      when 'month'
        unit_amount * quantity / interval_count
      when 'year'
        unit_amount * quantity / (12.0 / interval_count)
      end
    end
  end
end