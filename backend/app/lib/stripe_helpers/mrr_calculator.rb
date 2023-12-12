module StripeHelpers
  class MrrCalculator
    def self.calculate_for_swishjam_subscription_record(subscription)
      mrr = 0
      return mrr unless subscription.status == 'active' && subscription.canceled_at.nil?
      subscription.customer_subscription_items.sum do |item| 
        case item.price_recurring_interval
        when 'day'
          item.price_unit_amount.to_f * item.quantity.to_f * (30 / item.price_recurring_interval_count.to_f)
        when 'week'
          # 52 weeks per year / 12 months = 4.345 weeks per month
          item.price_unit_amount.to_f * item.quantity.to_f * (4.345 / item.price_recurring_interval_count.to_f)
        when 'month'
          item.price_unit_amount.to_f * item.quantity.to_f / item.price_recurring_interval_count.to_f
        when 'year'
          item.price_unit_amount.to_f * item.quantity.to_f / (12 * item.price_recurring_interval_count.to_f)
        end
      end
      mrr
    end

    def self.calculate_for_stripe_subscription(subscription)
      mrr = 0
      return mrr unless subscription.status == 'active' && subscription.canceled_at.nil?
      subscription.items.each do |subscription_item|
        case subscription_item.price.recurring.interval
        when 'day'
          mrr += subscription_item.price.unit_amount * subscription_item.quantity * (30.0 / subscription_item.price.recurring.interval_count)
        when 'week'
          mrr += subscription_item.price.unit_amount * subscription_item.quantity * (4.345 / subscription_item.price.recurring.interval_count)
        when 'month'
          mrr += subscription_item.price.unit_amount * subscription_item.quantity / subscription_item.price.recurring.interval_count
        when 'year'
          mrr += subscription_item.price.unit_amount * subscription_item.quantity / (12.0 / subscription_item.price.recurring.interval_count)
        end
      end
      mrr
    end
  end
end