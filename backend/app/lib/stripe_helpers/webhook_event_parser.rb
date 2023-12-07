module StripeHelpers
  class WebhookEventParser
    class << self
      def event_attributes_for(stripe_event, stripe_customer = nil)
        swishjam_event_data = {
          'uuid' => stripe_event.id,
          'event' => "stripe.#{stripe_event.type}",
          'timestamp' => stripe_event.created * 1_000,
          'object_id' => stripe_event.data.object.id,
        }.merge(custom_attributes_for(stripe_event))
        stripe_event.data.object.metadata.each do |key, value|
          swishjam_event_data["metadata_#{key}"] = value
        end
        if stripe_customer
          swishjam_event_data[Analytics::Event::ReservedPropertyNames.USER_PROFILE_EMAIL] = stripe_customer.email if stripe_customer.email
          swishjam_event_data['customer_email'] = stripe_customer.email if stripe_customer.email
          swishjam_event_data['customer_id'] = stripe_customer.id
          stripe_customer.metadata.each do |key, value|
            swishjam_event_data["customer_metadata_#{key}"] = value
          end
        end
        swishjam_event_data
      end

      private

      def custom_attributes_for(stripe_event)
        case stripe_event.type
        when 'customer.subscription.created'
          StripeHelpers::EventAttributeParsers::SubscriptionCreated.new(stripe_event).to_json
        when 'charge.failed'
          StripeHelpers::EventAttributeParsers::ChargeFailed.new(stripe_event).to_json
        when 'charge.succeeded'
          StripeHelpers::EventAttributeParsers::ChargeSucceeded.new(stripe_event).to_json
        else
          {}
        end
      end
      # charge.failed
      # charge.succeeded
      # billing_portal.configuration.created
      # billing_portal.configuration.updated
      # billing_portal.session.created
      # charge.captured
      # charge.dispute.closed
      # charge.dispute.created
      # charge.dispute.funds_reinstated
      # charge.dispute.updated
      # charge.expired
      # charge.failed
      # charge.pending
      # charge.refund.updated
      # charge.refunded
      # charge.succeeded
      # charge.updated
      # checkout.session.async_payment_succeeded
      # checkout.session.completed
      # checkout.session.expired
      # customer.created
      # customer.deleted
      # customer.source.expiring
      # customer.source.updated
      # customer.subscription.created
      # customer.subscription.deleted
      # customer.subscription.paused
      # customer.subscription.pending_update_applied
      # customer.subscription.pending_update_expired
      # customer.subscription.resumed
      # customer.subscription.trial_will_end
      # customer.subscription.updated
      # customer.updated
      # invoice.created
      # invoice.deleted
      # invoice.finalization_failed
      # invoice.finalized
      # invoice.marked_uncollectible
      # invoice.paid
      # invoice.payment_action_required
      # invoice.payment_failed
      # invoice.payment_succeeded
      # invoice.sent
      # invoice.upcoming
      # invoice.updated
      # invoice.voided
      # invoiceitem.created
      # invoiceitem.delete
      # radar.early_fraud_warning.created
      # radar.early_fraud_warning.updated
      # refund.created
      # refund.updated
      # subscription_schedule.canceled
      # subscription_schedule.completed
      # subscription_schedule.created
      # subscription_schedule.expiring
      # subscription_schedule.released
      # subscription_schedule.updated
    end
  end
end