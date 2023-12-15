module StripeHelpers
  class DataBackfiller
    def initialize(workspace, public_key, stripe_account_id)
      @workspace = workspace
      @public_key = public_key
      @stripe_account_id = stripe_account_id
      @active_subscriptions_for_day = {}
    end

    def backfill_billing_snapshots_and_stripe_events
      snapshot_date = Time.at(earliest_subscription.start_date).end_of_day
      while snapshot_date < Time.current.end_of_day
        puts "#{snapshot_date}:".colorize(:grey)
        puts "Active Subscriptions: #{num_active_subscriptions_for_day(snapshot_date)}".colorize(:blue)
        puts "Active Subscribers: #{num_active_subscribers_for_day(snapshot_date)}".colorize(:blue)
        puts "MRR: #{mrr_at_time(snapshot_date)}".colorize(:green)
        puts "\n"
        snapshot_date += 1.day
      end
      retroactively_trigger_all_churn_events
      nil
    end

    private

    def retroactively_trigger_all_churn_events
      churn_events = []
      sorted_subscriptions.each do |subscription|
        is_canceled = subscription.status == 'canceled' || (subscription.status == 'active' && subscription.canceled_at.present?)
        is_paid_subscription = subscription.items.data.any?{ |item| item.price.unit_amount.positive? }
        if is_canceled && is_paid_subscription
          stripe_customer = subscription.customer
          maybe_user_profile = @workspace.analytics_user_profiles.find_by_case_insensitive_email(stripe_customer.email)
          event_properties = {
            stripe_subscription_id: subscription.id,
            stripe_customer_id: stripe_customer&.id,
            stripe_customer_email: stripe_customer&.email,
            mrr: StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(subscription, include_canceled: true),
            cancellation_comment: subscription.cancellation_details&.comment,
            cancellation_feedback: subscription.cancellation_details&.feedback,
            cancellation_reason: subscription.cancellation_details&.reason,
          }
          # TODO - make the uuids for customer churn events consistent with the supplemental event evaluator
          churn_events << Analytics::Event.formatted_for_ingestion(
            swishjam_api_key: @public_key,
            ingested_at: Time.current,
            uuid: "#{subscription.id}-subscription-churned",
            name: 'stripe.supplemental.subscription.churned',
            occurred_at: Time.at(subscription.canceled_at),
            properties: event_properties,
          )

          customers_subscriptions = StripeHelpers::DataFetchers.get_all{ Stripe::Subscription.list({ status: 'all', customer: stripe_customer.id }, stripe_account: @stripe_account_id) }
          if customers_subscriptions.all?{ |subscription| subscription.status == 'canceled' || (subscription.status == 'active' && subscription.canceled_at.present?) }
            # TODO - make the uuids for customer churn events consistent with the supplemental event evaluator
            churn_events << Analytics::Event.formatted_for_ingestion(
              uuid: "#{stripe_customer.id}-#{customers_subscriptions.map(&:id).join('_')}-customer-churned",
              swishjam_api_key: @public_key,
              ingested_at: Time.current,
              name: 'stripe.supplemental.customer.churned',
              occurred_at: Time.at(subscription.canceled_at),
              properties: event_properties,
            )
          end
        end
      end
    end

    def mrr_at_time(snapshot_date)
      active_subscriptions_for_day(snapshot_date).sum do |subscription|
        StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(subscription, include_canceled: true)
      end
    end

    def num_active_subscribers_for_day(snapshot_date)
      active_subscriptions_for_day(snapshot_date).map{ |s| s.customer.id }.uniq.count
    end

    def num_active_subscriptions_for_day(snapshot_date)
      active_subscriptions_for_day(snapshot_date).count
    end

    def active_subscriptions_for_day(snapshot_date)
      @active_subscriptions_for_day[snapshot_date] ||= begin
        active_subscriptions = []
        sorted_subscriptions.each do |subscription| 
          active_subscriptions << subscription if subscription_was_active_at_time?(subscription, snapshot_date)
          break if Time.at(subscription.start_date) > snapshot_date
        end
        active_subscriptions
      end
    end

    def subscription_was_active_at_time?(subscription, snapshot_date)
      started_before_snapshot_date = Time.at(subscription.start_date) <= snapshot_date
      ended_after_snapshot_date = subscription.ended_at.nil? || Time.at(subscription.ended_at) > snapshot_date
      was_canceled_before_snapshot_date = subscription.canceled_at.present? && Time.at(subscription.canceled_at) < snapshot_date
      was_trialing_at_snapshot_date = subscription.trial_start.present? && Time.at(subscription.trial_start) <= snapshot_date && Time.at(subscription.trial_end) > snapshot_date
      is_paid_subscription = subscription.items.data.any? { |item| item.price.unit_amount > 0 }

      started_before_snapshot_date && ended_after_snapshot_date && !was_canceled_before_snapshot_date && !was_trialing_at_snapshot_date && is_paid_subscription
    end

    def earliest_subscription
      @earliest_subscription ||= sorted_subscriptions.first
    end

    def sorted_subscriptions
      @subscriptions ||= begin
        subscriptions = StripeHelpers::DataFetchers.get_all do
          Stripe::Subscription.list({ status: 'all', limit: 100, expand: ['data.customer', 'data.items.data.price'] }, stripe_account: @stripe_account_id)
        end
        subscriptions.sort_by{ |subscription| subscription.start_date }
      end
    end

    def get_customer(customer_id)
      @stripe_customer_dict ||= {}
      @stripe_customer_dict[customer_id] ||= begin 
        in_memory_customer = sorted_subscriptions.find{ |subscription| subscription.customer.id == customer_id }&.customer
        in_memory_customer || ::Stripe::Customer.retrieve(customer_id, { stripe_account: @stripe_account_id })
      end
    end
  end
end