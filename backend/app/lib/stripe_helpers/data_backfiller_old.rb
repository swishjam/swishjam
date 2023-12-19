module StripeHelpers
  class DataBackfillerOld
    def initialize(workspace:, public_key:, stripe_account_id:, start_date: nil, end_date: nil)
      @workspace = workspace
      @public_key = public_key
      @stripe_account_id = stripe_account_id
      @start_date = start_date
      @end_date = end_date
      @active_subscriptions_for_day = {}
      @events = []
    end

    def backfill_billing_snapshots_and_stripe_events
      sorted_subscription_events.each do |event|
        break if Time.at(event.created) >= @end_date
        next if !event_occurred_within_snapshot_period?(event)
        stripe_subscription = event.data.object
        stripe_customer = get_customer_with_cache(stripe_subscription.customer)
        case event.type
        when 'customer.subscription.created'
          evaluate_subscription_created_event(stripe_subscription, stripe_customer)
        when 'customer.subscription.updated'
          evaluate_subscription_updated_event(event, stripe_subscription, stripe_customer)
        end
      end
    end

    private

    def evaluate_subscription_created_event(stripe_subscription, stripe_customer)
      if subscription.status == 'active' && subscription.items.data.any?{ |item| item.price.unit_amount.positive? }
        customers_other_subscriptions = get_customer_subscriptions_with_cache(stripe_subscription.customer).reject{ |s| s.id == stripe_subscription.id }
        if customers_other_subscriptions.none?
          @events << Analytics::Event.formatted_for_ingestion(
            uuid: "#{stripe_subscription.id}-mrr-movement-new",
            swishjam_api_key: @public_key,
            name: Analytics::Event::ReservedNames.MRR_MOVEMENT,
            occurred_at: Time.at(stripe_subscription.created),
            properties: {
              movement_type: 'new',
              movement_amount: StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(stripe_subscription),
              stripe_subscription_id: stripe_subscription.id,
              stripe_customer_id: stripe_customer.id,
              stripe_customer_email: stripe_customer.email,
            }
          )
        elsif customers_other_subscriptions.all?{ |subscription| subscription.canceled_at.present? }
          @events << Analytics::Event.formatted_for_ingestion(
            uuid: "#{stripe_subscription.id}-mrr-movement-reactivation",
            swishjam_api_key: @public_key,
            name: Analytics::Event::ReservedNames.MRR_MOVEMENT,
            occurred_at: Time.at(stripe_subscription.created),
            properties: {
              movement_type: 'reactivation',
              movement_amount: StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(subscription),
              stripe_subscription_id: subscription.id,
              stripe_customer_id: subscription.customer.id,
              stripe_customer_email: subscription.customer.email,
            }
          )
        end
      end
    end

    def evaluate_subscription_updated_event(event, stripe_subscription, stripe_customer)
      did_just_cancel = stripe_subscription.canceled_at.present? && event.data.previous_attributes['canceled_at'].nil?
      if did_just_cancel
        @events << Analytics::Event.formatted_for_ingestion(
          uuid: "#{event.id}-mrr-movement-churn",
          swishjam_api_key: @public_key,
          name: Analytics::Event::ReservedNames.MRR_MOVEMENT,
          occurred_at: Time.at(event.created),
          properties: {
            movement_type: 'churn',
            movement_amount: StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(stripe_subscription),
            stripe_subscription_id: stripe_subscription.id,
            stripe_customer_id: stripe_subscription.customer.id,
            stripe_customer_email: stripe_subscription.customer.email,
          }
        )
      else
        did_just_contract = event.data.previous_attributes['items'].present? && StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(stripe_subscription) < StripeHelpers::MrrCalculator.calculate_for_stripe_subscription_items(event.data.previous_attributes['items']['data'])
        if did_just_contract
          @events << Analytics::Event.formatted_for_ingestion(
            uuid: "#{event.id}-mrr-movement-contraction",
            swishjam_api_key: @public_key,
            name: Analytics::Event::ReservedNames.MRR_MOVEMENT,
            occurred_at: Time.at(event.created),
            properties: {
              movement_type: 'contraction',
              movement_amount: StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(stripe_subscription) - StripeHelpers::MrrCalculator.calculate_for_stripe_subscription_items(event.data.previous_attributes['items']['data']),
              stripe_subscription_id: stripe_subscription.id,
              stripe_customer_id: stripe_subscription.customer.id,
              stripe_customer_email: stripe_subscription.customer.email,
            }
          )
        end
      end
    end

    def retroactively_trigger_all_supplemental_events
      sorted_subscriptions.each do |subscription|
        enqueue_churn_event_for_subscription_if_necessary(subscription)
        enqueue_mrr_movement_event_for_subscription_if_necessary(subscription)
      end
    end

    def enqueue_mrr_movement_event_for_subscription_if_necessary(subscription)
      is_canceled = subscription.status == 'canceled' || (subscription.status == 'active' && subscription.canceled_at.present?)
      is_paid_subscription = subscription.items.data.any?{ |item| item.price.unit_amount.positive? }
      churned_within_snapshot_period = subscription.canceled_at.present? && Time.at(subscription.canceled_at) >= @start_date && Time.at(subscription.canceled_at) < @end_date
      if is_canceled && is_paid_subscription && churned_within_snapshot_period
        @events << Analytics::Event.formatted_for_ingestion(
          uuid: "#{subscription.id}-subscription-canceled-mrr-movement",
          name: "stripe.supplemental.subscription.mrr_movement",
          occurred_at: Time.at(subscription.canceled_at),
          swishjam_api_key: @public_key,
          properties: {
            movement_type: 'churn',
            movement_amount: -1 * StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(subscription, include_canceled: true),
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer.id,
            stripe_customer_email: subscription.customer.email,
          }
        )
      end


    end

    def enqueue_churn_event_for_subscription_if_necessary(subscription)
      # pretty sure we can just check if it has a canceled_at and if it does, but just in case I guess
      is_canceled = subscription.status == 'canceled' || (subscription.status == 'active' && subscription.canceled_at.present?)
      is_paid_subscription = subscription.items.data.any?{ |item| item.price.unit_amount.positive? }
      churned_within_snapshot_period = subscription.canceled_at.present? && Time.at(subscription.canceled_at) >= @start_date && Time.at(subscription.canceled_at) < @end_date
      if is_canceled && is_paid_subscription && churned_within_snapshot_period
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
        @events << Analytics::Event.formatted_for_ingestion(
          swishjam_api_key: @public_key,
          ingested_at: Time.current,
          uuid: "#{subscription.id}-subscription-churned",
          name: 'stripe.supplemental.subscription.churned',
          occurred_at: Time.at(subscription.canceled_at),
          properties: event_properties,
        )

        customers_subscriptions = get_customer_subscriptions_with_cache(stripe_customer.id)
        if customers_subscriptions.all?{ |subscription| subscription.status == 'canceled' || (subscription.status == 'active' && subscription.canceled_at.present?) }
          @events << Analytics::Event.formatted_for_ingestion(
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

    def event_occurred_within_snapshot_period?(event)
      Time.at(event.created) >= @start_date && Time.at(event.created) < @end_date
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

    def sorted_subscription_events
      @sorted_subscription_update_events ||= begin
        subscription_update_events = StripeHelpers::DataFetchers.get_all do
          Stripe::Event.list({ types: ['customer.subscription.created', 'customer.subscription.updated'], limit: 100 }, stripe_account: @stripe_account_id)
        end
        subscription_update_events.sort_by{ |event| event.created }
      end
    end

    def get_customer_with_cache(customer_id)
      @stripe_customer_dict ||= {}
      @stripe_customer_dict[customer_id] ||= begin 
        ::Stripe::Customer.retrieve(customer_id, { stripe_account: @stripe_account_id })
      end
    end

    def get_customer_subscriptions_with_cache(customer_id)
      @stripe_customer_subscriptions_dict ||= {}
      @stripe_customer_subscriptions_dict[customer_id] ||= begin
        StripeHelpers::DataFetchers.get_all do
          Stripe::Subscription.list({ status: 'all', customer: customer_id, expand: ['data.customer', 'data.items.data.price'] }, stripe_account: @stripe_account_id)
        end
      end
    end
  end
end