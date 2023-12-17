module StripeHelpers
  class MrrMovementHandler
    class MovementTypes
      class << self
        TYPES = %i[NEW RE_ACTIVATION EXPANSION CONTRACTION CHURN]
        
        TYPES.each do |movement_type|
          define_method(movement_type) do
            movement_type.to_s.gsub('_', '-').downcase
          end
        end
      end
    end

    def initialize(workspace:, public_key:, stripe_account_id:, start_date: nil, end_date: nil)
      @workspace = workspace
      @public_key = public_key
      @stripe_account_id = stripe_account_id
      @start_date = start_date
      @end_date = end_date
      @active_subscriptions_for_day = {}
      @events = []
    end

    def enqueue_mrr_movement_events
      sorted_subscription_events_within_snapshot_period.each do |event|
        stripe_subscription = event.data.object
        stripe_customer = get_customer_with_cache(stripe_subscription.customer)
        case event.type
        when 'customer.subscription.created'
          evaluate_subscription_created_event(stripe_subscription, stripe_customer)
        when 'customer.subscription.updated'
          evaluate_subscription_updated_event(event, stripe_subscription, stripe_customer)
        end
      end
      # Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, @events) if @events.any?
      @events.count
    end

    private

    def evaluate_subscription_created_event(stripe_subscription, stripe_customer)
      if stripe_subscription.status == 'active' && stripe_subscription.items.data.any?{ |item| item.price.unit_amount.positive? }
        customers_other_subscriptions = get_customer_subscriptions_with_cache(stripe_subscription.customer).reject{ |s| s.id == stripe_subscription.id }
        if customers_other_subscriptions.none?
          @events << Analytics::Event.formatted_for_ingestion(
            uuid: "#{stripe_subscription.id}-mrr-movement-new",
            swishjam_api_key: @public_key,
            name: Analytics::Event::ReservedNames.MRR_MOVEMENT,
            occurred_at: Time.at(stripe_subscription.created),
            properties: {
              movement_type: MovementTypes.NEW,
              movement_amount: StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(stripe_subscription),
              stripe_subscription_id: stripe_subscription.id,
              stripe_customer_id: stripe_customer.id,
              stripe_customer_email: stripe_customer.email,
            }
          )
        elsif customers_other_subscriptions.all?{ |subscription| subscription.canceled_at.present? }
          @events << Analytics::Event.formatted_for_ingestion(
            uuid: "#{stripe_subscription.id}-mrr-movement-re-activation",
            swishjam_api_key: @public_key,
            name: Analytics::Event::ReservedNames.MRR_MOVEMENT,
            occurred_at: Time.at(stripe_subscription.created),
            properties: {
              movement_type: MovementTypes.RE_ACTIVATION,
              movement_amount: StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(stripe_subscription),
              stripe_subscription_id: stripe_subscription.id,
              stripe_customer_id: stripe_customer.id,
              stripe_customer_email: stripe_customer.email,
            }
          )
        elsif customers_other_subscriptions.any?{ |subscription| subscription.items.data.any?{ |item| item.price.unit_amount.positive? } }
          @events << Analytics::Event.formatted_for_ingestion(
            uuid: "#{stripe_subscription.id}-mrr-movement-expansion",
            swishjam_api_key: @public_key,
            name: Analytics::Event::ReservedNames.MRR_MOVEMENT,
            occurred_at: Time.at(stripe_subscription.created),
            properties: {
              movement_type: MovementTypes.EXPANSION,
              movement_amount: StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(stripe_subscription),
              stripe_subscription_id: stripe_subscription.id,
              stripe_customer_id: stripe_customer.id,
              stripe_customer_email: stripe_customer.email,
            }
          )
        end
      end
    end
    alias evaluate_new_active_subscription evaluate_subscription_created_event

    def evaluate_subscription_updated_event(event, stripe_subscription, stripe_customer)
      did_just_cancel = stripe_subscription.canceled_at.present? && 
                          event.data.previous_attributes.keys.include?(:canceled_at) && 
                          event.data.previous_attributes[:canceled_at].nil? && 
                          # to avoid counting incomplete subscriptions as churns (subscriptions that were created but never paid for)
                          (stripe_subscription.status == 'active' || stripe_subscription.status == 'canceled')
      did_just_become_active_from_incomplete = stripe_subscription.status == 'active' && event.data.previous_attributes[:status] == 'incomplete'
      did_just_contract = event.data.previous_attributes[:items].present? && StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(stripe_subscription) < StripeHelpers::MrrCalculator.calculate_for_stripe_subscription_items(event.data.previous_attributes[:items][:data])

      if did_just_become_active_from_incomplete
        evaluate_new_active_subscription(stripe_subscription, stripe_customer)
      elsif did_just_cancel
        @events << Analytics::Event.formatted_for_ingestion(
          uuid: "#{event.id}-mrr-movement-churn",
          swishjam_api_key: @public_key,
          name: Analytics::Event::ReservedNames.MRR_MOVEMENT,
          occurred_at: Time.at(event.created),
          properties: {
            movement_type: MovementTypes.CHURN,
            movement_amount: StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(stripe_subscription, include_canceled: true),
            stripe_subscription_id: stripe_subscription.id,
            stripe_customer_id: stripe_customer.id,
            stripe_customer_email: stripe_customer.email,
          }
        )
      elsif did_just_contract
        @events << Analytics::Event.formatted_for_ingestion(
          uuid: "#{event.id}-mrr-movement-contraction",
          swishjam_api_key: @public_key,
          name: Analytics::Event::ReservedNames.MRR_MOVEMENT,
          occurred_at: Time.at(event.created),
          properties: {
            movement_type: MovementTypes.CONTRACTION,
            movement_amount: StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(stripe_subscription) - StripeHelpers::MrrCalculator.calculate_for_stripe_subscription_items(event.data.previous_attributes['items']['data']),
            stripe_subscription_id: stripe_subscription.id,
            stripe_customer_id: stripe_customer.id,
            stripe_customer_email: stripe_customer.email,
          }
        )
      end
    end

    def sorted_subscription_events_within_snapshot_period
      @sorted_subscription_events_within_snapshot_period ||= begin
        subscription_update_events = StripeHelpers::DataFetchers.get_all(starts_after: @start_date, ends_before: @end_date) do
          Stripe::Event.list({ types: ['customer.subscription.created', 'customer.subscription.updated'], limit: 100 }, stripe_account: @stripe_account_id)
        end
        subscription_update_events.select{ |event| event.created >= @start_date.to_i && event.created < @end_date.to_i }
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