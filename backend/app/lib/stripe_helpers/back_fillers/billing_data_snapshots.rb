module StripeHelpers
  module BackFillers
    class BillingDataSnapshots < Base
      def backfill_snapshots!(starting_at: 1.year.ago)
        billing_data_snapshots_to_insert = []
        current_date = starting_at.beginning_of_day
        while current_date < Time.current
          billing_data_snapshots_to_insert << { 
            swishjam_api_key: public_key,
            total_revenue_in_cents: calculate_total_revenue_generated_at_point_in_time(current_date),
            num_customers_with_paid_subscriptions: calculate_num_customers_with_paid_subscriptions_at_point_in_time(current_date),
            num_active_subscriptions: active_subscriptions_at_point_in_time(current_date).count,
            num_paid_subscriptions: active_subscriptions_at_point_in_time(current_date).count, # should we consider these the same...? why do we need both?
            num_free_trial_subscriptions: free_trial_subscriptions_at_point_in_time(current_date).count,
            captured_at: current_date,
            mrr_in_cents: calculate_mrr_at_point_in_time(current_date),
            # num_canceled_subscriptions
          }
          current_date += 1.day
        end
        Analytics::BillingDataSnapshot.insert_all!(billing_data_snapshots_to_insert)
      end

      private

      def calculate_mrr_at_point_in_time(time)
        active_subscriptions_at_point_in_time(time).sum do |subscription|
          StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(subscription, include_canceled: true, include_trialing: true)
        end
      end

      def free_trial_subscriptions_at_point_in_time(time)
        data_fetcher.subscriptions_for_all_of_time.select{ |subscription| (subscription.trial_end || 0) > time.to_i && (subscription.trial_start || Float::INFINITY) <= time.to_i }
      end

      def active_subscriptions_at_point_in_time(time)
        instance_variable_get(:"@active_subscriptions_at_point_in_time_#{time.to_i}") || begin
          active_subscriptions = data_fetcher.subscriptions_for_all_of_time.select{ |subscription| subscription_was_active_at_point_in_time?(subscription, time) }
          instance_variable_set(:"@active_subscriptions_at_point_in_time_#{time.to_i}", active_subscriptions)
        end
      end

      def calculate_num_customers_with_paid_subscriptions_at_point_in_time(time)
        customer_ids = Set.new
        active_subscriptions_at_point_in_time(time).each do |subscription|
          customer_ids.add(subscription.customer)
        end
        customer_ids.size
      end
      
      def subscription_was_active_at_point_in_time?(subscription, time)
        was_not_cancelled = subscription.canceled_at.nil? || subscription.canceled_at > time.to_i
        was_not_trialing = subscription.trial_end.nil? || subscription.trial_end < time.to_i
        started_before_or_at_point_in_time = subscription.start_date <= time.to_i
        did_not_end_before_point_in_time = subscription.ended_at.nil? || subscription.ended_at > time.to_i
        is_paid = subscription.items.data.any?{ |item| item.price.unit_amount > 0 }
        started_before_or_at_point_in_time && 
          was_not_cancelled && 
          was_not_trialing && 
          did_not_end_before_point_in_time && 
          is_paid
      end

      def calculate_total_revenue_generated_at_point_in_time(time)
        revenue_by_day.take_while{ |date, _| date <= time }.sum{ |_, revenue| revenue }
      end

      def revenue_by_day
        @charges_by_day ||= begin 
          dict = Hash.new.tap do |hash|
            data_fetcher.charges_for_all_of_time.each do |charge|
              next if charge.status != 'succeeded'
              date = Time.at(charge.created).beginning_of_day
              hash[date] ||= 0
              hash[date] += charge.amount - charge.amount_refunded
            end
          end
          # [ [date, revenue], [date, revenue], ... ]
          dict.sort
        end
      end
    end
  end
end