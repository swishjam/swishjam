module StripeHelpers
  class SupplementalEventEvaluator
    def initialize(stripe_event:, stripe_customer:, public_key:, maybe_user_profile_id:)
      @stripe_event = stripe_event
      @stripe_customer = stripe_customer
      @public_key = public_key
      @maybe_user_profile_id = maybe_user_profile_id
    end

    def format_supplemental_events_to_be_processed_if_necessary!
      events = []
      if @stripe_event.type == 'customer.subscription.updated' && is_churned_subscription_event?
        events << subscription_churned_event
        if @stripe_customer
          all_subscriptions_for_customer = StripeHelpers::DataFetchers.get_all do 
            ::Stripe::Subscription.list({ status: 'all', customer: @stripe_customer.id }, stripe_account: @stripe_event.account)
          end
          if all_subscriptions_for_customer.data.all?{ |subscription| subscription.status == 'canceled' || subscription.canceled_at.present? }
            events << customer_churned_event
          end
        else
          # if there is no customer associated with the subscription, we consider this a customer churn
          events << customer_churned_event
        end
      end
      events
    end

    def is_churned_subscription_event?
      just_canceled = @stripe_event.data.previous_attributes['status'] == 'active' && @stripe_event.data.object.status == 'canceled' ||
                          @stripe_event.data.previous_attributes['canceled_at'].nil? && !@stripe_event.data.object.canceled_at.nil?
      is_paid_subscription = @stripe_event.data.object.items.data.any?{ |item| item.price.unit_amount.positive? }
      just_canceled && is_paid_subscription
    end

    def subscription_churned_event
      Analytics::Event.formatted_for_ingestion(
        ingested_at: Time.current,
        uuid: "#{@stripe_event.id}-subscription-churned",
        swishjam_api_key: @public_key,
        name: 'stripe.supplemental.subscription.churned',
        occurred_at: Time.at(@stripe_event.data.object.canceled_at),
        properties: supplemental_event_properties,
      )
    end

    def customer_churned_event
      Analytics::Event.formatted_for_ingestion(
        ingested_at: Time.current,
        uuid: "#{@stripe_event.id}-customer-churned",
        swishjam_api_key: @public_key,
        name: 'stripe.supplemental.customer.churned',
        occurred_at: Time.at(@stripe_event.data.object.canceled_at),
        properties: supplemental_event_properties,
      )
    end

    def supplemental_event_properties(include_canceled_subscriptions_in_mrr: true)
      {
        stripe_subscription_id: @stripe_event.data.object.id,
        stripe_customer_id: @stripe_customer&.id,
        stripe_customer_email: @stripe_customer&.email,
        mrr: StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(@stripe_event.data.object, include_canceled: include_canceled_subscriptions_in_mrr),
        cancellation_comment: @stripe_event.data.object.cancellation_details&.comment,
        cancellation_feedback: @stripe_event.data.object.cancellation_details&.feedback,
        cancellation_reason: @stripe_event.data.object.cancellation_details&.reason,
        user_profile_id: @maybe_user_profile_id
      }
    end
  end
end