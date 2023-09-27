module DataSynchronizers
  class Stripe
    class BillingEventsGenerator
      def initialize(workspace, stripe_account_id, start_time:, end_time: Time.current)
        @workspace = workspace
        @events_for_time_period = StripeHelpers::DataFetchers.get_all_events(
          stripe_account_id, 
          %w[
            customer.subscription.updated 
            customer.subscription.created 
            customer.subscription.deleted 
            customer.subcription.paused
            customer.subcription.resumed
          ],
          created_after: start_time
        )
      end

      def create_billing_events!
        Analytics::Event.insert_all!(format_billing_events_insert_data)
      end

      private

      def format_billing_events_insert_data
        insert_data = []
        @events_for_time_period.map do |event|
          case event.type
          when 'customer.subscription.created'
            insert_data << billing_event(Analytics::Event::ReservedNames.NEW_SUBSCRIPTION, event)
          
            if event.data.object.status == 'trialing'
              insert_data << billing_event(Analytics::Event::ReservedNames.NEW_FREE_TRIAL_SUBSCRIPTION, event)

            elsif event.data.object.status == 'active' && mrr_for_subscription(event.data.object) > 0
              insert_data << billing_event(Analytics::Event::ReservedNames.NEW_PAID_SUBSCRIPTION, event)
            end
          when 'customer.subscription.resumed'
            insert_data << billing_event(Analytics::Event::ReservedNames.RESUMED_SUBSCRIPTION, event)
            # if the resumed subscription was paid, also count it as a resumed paid subscription
            if mrr_for_subscription(event.data.object) > 0
              insert_data << billing_event(Analytics::Event::ReservedNames.RESUMED_PAID_SUBSCRIPTION, event)
            end
          when 'customer.subscription.paused'
            insert_data << billing_event(Analytics::Event::ReservedNames.PAUSED_SUBSCRIPTION, event)
            # if the paused subscription was paid, also count it as a paused paid subscription
            if mrr_for_subscription(event.data.object) > 0
              # @num_paused_paid_subscriptions_for_time_period += 1
              insert_data << billing_event(Analytics::Event::ReservedNames.PAUSED_PAID_SUBSCRIPTION, event)
            end
          when 'customer.subscription.updated'
            # if a subscription moved from any status besides trialing to trialing, it's a new free trial
            if event.data.previous_attributes['status'] && event.data.previous_attributes['status'] != 'trialing' && event.data.object.status == 'trialing'
              insert_data << billing_event(Analytics::Event::ReservedNames.NEW_FREE_TRIAL_SUBSCRIPTION, event)
            end

            # if a subscription moved from any status to active and it has an amount above 0, it's a new paid subscription
            if event.data.previous_attributes['status'] && event.data.previous_attributes['status'] != 'active' && event.data.object.status == 'active' && mrr_for_subscription(event.data.object) > 0
              insert_data << billing_event(Analytics::Event::ReservedNames.NEW_PAID_SUBSCRIPTION, event)
            end

            # if a subscription moved from any status to canceled, it's a new canceled subscription
            # if it was paid, also count it is a new canceled paid subscription, and add the amount to the churned amount
            if event.data.previous_attributes['status'] && event.data.previous_attributes['status'] != 'canceled' && event.data.object.status == 'canceled'
              insert_data << billing_event(Analytics::Event::ReservedNames.CANCELED_SUBSCRIPTION, event)
              
              if mrr_for_subscription(event.data.object) > 0
                insert_data << billing_event(Analytics::Event::ReservedNames.CANCELED_PAID_SUBSCRIPTION, event)
              end
            end

            # if the items in the subscription have changed, calculate the upgraded or downgraded amount
            if event.data.previous_attributes['items']
              previous_mrr = mrr_for_subscription(event.data.previous_attributes)
              change_in_amount = mrr_for_subscription(event.data.object) - previous_mrr
              if change_in_amount > 0
                insert_data << billing_event(Analytics::Event::ReservedNames.UPGRADED_SUBSCRIPTION, event, { upgraded_mrr_in_cents: change_in_amount })
              elsif change_in_amount < 0
                insert_data << billing_event(Analytics::Event::ReservedNames.DOWNGRADED_SUBSCRIPTION, event, { downgraded_mrr_in_cents: change_in_amount })
              end
            end
          end
        end
        insert_data
      end

      def mrr_for_subscription(subscription)
        # return 0 if subscription.status != 'active' && !allow_inactive_subscriptions
        mrr = 0
        subscription.items.data.each do |subscription_item|
          case subscription_item.price.recurring.interval
          when 'day'
            num_days_in_this_month = (Time.current.next_month.beginning_of_month - Time.current.beginning_of_month) / (60 * 60 * 24)
            mrr += subscription_item.price.unit_amount * subscription_item.quantity * num_days_in_this_month / subscription_item.price.recurring.interval_count
          when 'week'
            num_weeks_in_this_month = (Time.current.next_month.beginning_of_month - Time.current.beginning_of_month) / (60 * 60 * 24 * 7)
            mrr += subscription_item.price.unit_amount * subscription_item.quantity * num_weeks_in_this_month / subscription_item.price.recurring.interval_count
          when 'month'
            mrr += subscription_item.price.unit_amount * subscription_item.quantity / subscription_item.price.recurring.interval_count
          when 'year'
            mrr += subscription_item.price.unit_amount * subscription_item.quantity / 12 / subscription_item.price.recurring.interval_count
          else
            raise "Unknown interval: #{subscription_item.price.recurring.interval}, cannot calculate MRR."
          end
        end
        mrr
      end

      def billing_event(name, stripe_event_obj, additional_properties = {})
        {
          swishjam_api_key: @workspace.public_key,
          name: name,
          occurred_at: Time.at(stripe_event_obj.created),
          analytics_family: 'billing',
          ingested_at: Time.current,
          properties: {
            source: 'stripe',
            mrr_in_cents: mrr_for_subscription(stripe_event_obj.data.object),
            subscription_id: stripe_event_obj.data.object.id,
          }.merge(additional_properties)
        }
      end

    end
  end
end