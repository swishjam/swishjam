module StripeHelpers
  module SupplementalEvents
    class Evaluator
      def initialize(stripe_event:, stripe_customer:, public_key:, maybe_user_profile_id:)
        @stripe_event = stripe_event
        @stripe_customer = stripe_customer
        @public_key = public_key
        @maybe_user_profile_id = maybe_user_profile_id
      end

      def parsed_events_for_any_matching_supplemental_events
        events = []        
        events << formatted_supplemental_event(StripeHelpers::SupplementalEvents::SubscriptionChurned) if is_churned_subscription_event?
        events << formatted_supplemental_event(StripeHelpers::SupplementalEvents::CancellationFeedbackReceived) if just_received_cancellation_feedback?
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
          stripe_event: @stripe_event,
          user_profile_id: @maybe_user_profile_id,
          stripe_customer: @stripe_customer,
          public_key: @public_key,
        ).as_parsed_event
      end

      def is_new_paid_subscription_event?
        return false unless ['customer.subscription.created', 'customer.subscription.updated'].include?(@stripe_event.type)
        is_paid_subscription = stripe_object.items.data.any?{ |item| item.price.unit_amount.positive? }
        updated_to_active = @stripe_event.type == 'customer.subscription.updated' && attribute_changed_to?('status', 'active')
        created_as_active = @stripe_event.type == 'customer.subscription.created' && stripe_object.status == 'active'
        is_paid_subscription && (created_as_active || updated_to_active)
      end

      def is_churned_subscription_event?
        is_potential_churn_event = @stripe_event.type == 'customer.subscription.updated' && stripe_object.canceled_at.present?
        return false if !is_potential_churn_event
        
        was_or_is_active = stripe_object.status === 'active' || previous_attributes['status'] == 'active'
        return false if !was_or_is_active

        just_canceled_at = previous_attributes.keys.include?(:canceled_at) && previous_attributes['canceled_at'].nil? && stripe_object.canceled_at.present?
        return false if !just_canceled_at

        is_paid_subscription = stripe_object.items.data.any?{ |item| item.price.unit_amount.positive? }
        return false if !is_paid_subscription
        # wasnt_during_free_trial = stripe_object.trial_end.nil? || stripe_object.canceled_at > stripe_object.trial_end
        
        true
      end

      def just_received_cancellation_feedback?
        cancellation_details = previous_attributes['cancellation_details'] || {}
        cancellation_details.keys.include?(:feedback) || cancellation_details.keys.include?(:comment)
      end

      def is_new_free_trial_event?
        is_new_subscription_with_free_trial = @stripe_event.type == 'customer.subscription.created' && stripe_object.status == 'trialing' 
        subscription_updated_to_free_trial = @stripe_event.type == 'customer.subscription.updated' && attribute_changed_to?('status', 'trialing')
        is_new_subscription_with_free_trial || subscription_updated_to_free_trial
      end

      def attribute_changed_to?(attribute_name, value)
        attribute_changed?(attribute_name) && previous_attributes[attribute_name.to_s] != value && stripe_object[attribute_name.to_s] == value
      end

      def attribute_changed?(attribute_name)
        # pretty sure it's always symbols, but just incase
        previous_attributes.keys.include?(attribute_name.to_sym) || previous_attributes.keys.include?(attribute_name.to_s)
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