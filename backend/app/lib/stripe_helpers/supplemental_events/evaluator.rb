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
        events << formatted_supplemental_event(StripeHelpers::SupplementalEvents::SubscriptionChurned) if is_churned_subscription_event?
        events << formatted_supplemental_event(StripeHelpers::SupplementalEvents::NewFreeTrial) if is_new_free_trial_event?
        events << formatted_supplemental_event(StripeHelpers::SupplementalEvents::NewActiveSubscription) if is_new_paid_subscription_event?
        events << formatted_supplemental_event(StripeHelpers::SupplementalEvents::ChargeSucceeded) if @stripe_event.type == 'charge.succeeded'
        events << formatted_supplemental_event(StripeHelpers::SupplementalEvents::NewSubscriber) if @stripe_event.type == 'customer.created'
        events
      rescue => e
        Sentry.capture_exception(e)
        []
      end

      private

      def formatted_supplemental_event(event_class)
        event_class.new(
          stripe_object,
          user_profile_id: @maybe_user_profile_id,
          stripe_customer: @stripe_customer,
          public_key: @public_key,
        ).as_swishjam_event
      end

      def is_new_paid_subscription_event?
        return false unless ['customer.subscription.created', 'customer.subscription.updated'].include?(@stripe_event.type)
        is_paid_subscription = stripe_object.items.data.any?{ |item| item.price.unit_amount.positive? }
        is_paid_subscription && (stripe_object.status == 'active' || attribute_changed_to?('status', 'active'))
      end

      def is_churned_subscription_event?
        return false if @stripe_event.type != 'customer.subscription.updated'
        just_became_canceled = previous_attributes['status'] == 'active' && stripe_object.status == 'canceled'
        just_canceled_at = previous_attributes.keys.include?(:canceled_at) && previous_attributes['canceled_at'].nil? && stripe_object.canceled_at.present?
        is_paid_subscription = stripe_object.items.data.any?{ |item| item.price.unit_amount.positive? }
        wasnt_during_free_trial = stripe_object.trial_end.nil? || stripe_object.canceled_at > stripe_object.trial_end
        (just_became_canceled || just_canceled_at) && is_paid_subscription
      end

      def is_new_free_trial_event?
        is_new_subscription_with_free_trial = @stripe_event.type == 'customer.subscription.created' && stripe_object.status == 'trialing' 
        subscription_updated_to_free_trial = @stripe_event.type == 'customer.subscription.updated' && attribute_changed_to?('status', 'trialing')
        is_new_subscription_with_free_trial || subscription_updated_to_free_trial
      end

      def attribute_changed_to?(attribute_name, value)
        previous_attributes.keys.include?(attribute_name.to_sym) && previous_attributes[attribute_name.to_s] != value && stripe_object[attribute_name.to_s] == value
      end

      def stripe_object
        @stripe_event.data.object
      end

      def previous_attributes
        return {} if !@stripe_event.data.respond_to?(:previous_attributes) || @stripe_event.data.previous_attributes.nil?
        @stripe_event.data.previous_attributes
      end
    end
  end
end