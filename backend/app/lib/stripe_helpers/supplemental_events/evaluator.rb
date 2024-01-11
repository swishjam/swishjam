module StripeHelpers
  module SupplementalEvents
    class Evaluator
      def initialize(stripe_event:, stripe_customer:, public_key:, maybe_user_profile_id:)
        @stripe_event = stripe_event
        @stripe_customer = stripe_customer
        @public_key = public_key
        @maybe_user_profile_id = maybe_user_profile_id
      end

      def format_supplemental_events_to_be_processed_if_necessary!
        events = []
        if @stripe_event.type == 'customer.subscription.updated' && is_churned_subscription_event?
          events << Analytics::Event.formatted_for_ingestion(
            ingested_at: Time.current,
            uuid: "#{@stripe_event.id}-subscription-churned",
            swishjam_api_key: @public_key,
            name: StripeHelpers::SupplementalEvents::Types.SUBSCRIPTION_CHURNED,
            occurred_at: Time.at(stripe_object.canceled_at),
            properties: {
              stripe_subscription_id: stripe_object.id,
              stripe_customer_id: stripe_object.customer,
              stripe_customer_email: @stripe_customer&.email,
              mrr: StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(stripe_object, include_canceled: true),
              cancellation_comment: stripe_object.cancellation_details&.comment,
              cancellation_feedback: stripe_object.cancellation_details&.feedback,
              cancellation_reason: stripe_object.cancellation_details&.reason,
              user_profile_id: @maybe_user_profile_id
            },
          )
          # if @stripe_customer
          #   all_subscriptions_for_customer = StripeHelpers::DataFetchers.get_all do 
          #     ::Stripe::Subscription.list({ status: 'all', customer: @stripe_customer.id }, stripe_account: @stripe_event.account)
          #   end
          #   if all_subscriptions_for_customer.data.all?{ |subscription| subscription.status == 'canceled' || subscription.canceled_at.present? }
          #     events << customer_churned_event
          #   end
          # else
          #   # if there is no customer associated with the subscription, we consider this a customer churn
          #   events << customer_churned_event
          # end
        elsif @stripe_event.type == 'customer.subscription.created' && stripe_object.status == 'trialing'
          events << Analytics::Event.formatted_for_ingestion(
            ingested_at: Time.current,
            uuid: "#{@stripe_event['id']}-new-trial",
            swishjam_api_key: @public_key,
            name: StripeHelpers::SupplementalEvents::Types.NEW_FREE_TRIAL,
            occurred_at: Time.at(@stripe_event.created),
            properties: {
              stripe_subscription_id: stripe_object.id,
              stripe_customer_id: stripe_object.customer,
              stripe_customer_email: @stripe_customer&.email,
              potential_mrr: StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(stripe_object, include_trialing: true),
              user_profile_id: @maybe_user_profile_id
            },
          )
        end
        events
      end

      def is_churned_subscription_event?
        just_became_canceled = @stripe_event.data.previous_attributes['status'] == 'active' && stripe_object.status == 'canceled'
        just_canceled_at = @stripe_event.data.previous_attributes.keys.include?(:canceled_at) && @stripe_event.data.previous_attributes['canceled_at'].nil? && !stripe_object.canceled_at.nil?
        is_paid_subscription = stripe_object.items.data.any?{ |item| item.price.unit_amount.positive? }
        (just_became_canceled || just_canceled_at) && is_paid_subscription
      end

      def stripe_object
        @stripe_event.data.object
      end

      # def churn_event_properties(include_canceled_subscriptions_in_mrr: true)
      #   {
      #     stripe_subscription_id: stripe_object.id,
      #     stripe_customer_id: @stripe_customer&.id,
      #     stripe_customer_email: @stripe_customer&.email,
      #     mrr: StripeHelpers::MrrCalculator.calculate_for_stripe_subscription(stripe_object, include_canceled: include_canceled_subscriptions_in_mrr),
      #     cancellation_comment: stripe_object.cancellation_details&.comment,
      #     cancellation_feedback: stripe_object.cancellation_details&.feedback,
      #     cancellation_reason: stripe_object.cancellation_details&.reason,
      #     user_profile_id: @maybe_user_profile_id
      #   }
      # end

      # def customer_churned_event
      #   Analytics::Event.formatted_for_ingestion(
      #     ingested_at: Time.current,
      #     uuid: "#{@stripe_event.id}-customer-churned",
      #     swishjam_api_key: @public_key,
      #     name: 'stripe.supplemental.customer.churned',
      #     occurred_at: Time.at(stripe_object.canceled_at),
      #     properties: churn_event_properties,
      #   )
      # end
    end
  end
end