module StripeHelpers
  class WebhookManager
    BASE_URL = ENV['WEBHOOK_RECEIVER_HOST_URL'] || 'https://capture.swishjam.com'

    def self.create_webhook_for(stripe_account_id)
      Stripe::WebhookEndpoint.create({
        url: "#{BASE_URL}/api/v1/webhooks/stripe",
        description: "Webhook to send Stripe events to Swishjam.",
        connect: true,
        enabled_events: %w[
          charge.failed
          charge.succeeded
          billing_portal.configuration.created
          billing_portal.configuration.updated
          billing_portal.session.created
          charge.captured
          charge.dispute.closed
          charge.dispute.created
          charge.dispute.funds_reinstated
          charge.dispute.updated
          charge.expired
          charge.failed
          charge.pending
          charge.refund.updated
          charge.refunded
          charge.succeeded
          charge.updated
          checkout.session.async_payment_succeeded
          checkout.session.completed
          checkout.session.expired
          customer.created
          customer.deleted
          customer.source.expiring
          customer.source.updated
          customer.subscription.created
          customer.subscription.deleted
          customer.subscription.paused
          customer.subscription.pending_update_applied
          customer.subscription.pending_update_expired
          customer.subscription.resumed
          customer.subscription.trial_will_end
          customer.subscription.updated
          customer.updated
          invoice.created
          invoice.deleted
          invoice.finalization_failed
          invoice.finalized
          invoice.marked_uncollectible
          invoice.paid
          invoice.payment_action_required
          invoice.payment_failed
          invoice.payment_succeeded
          invoice.sent
          invoice.upcoming
          invoice.updated
          invoice.voided
          invoiceitem.created
          invoiceitem.delete
          radar.early_fraud_warning.created
          radar.early_fraud_warning.updated
          refund.created
          refund.updated
          subscription_schedule.canceled
          subscription_schedule.completed
          subscription_schedule.created
          subscription_schedule.expiring
          subscription_schedule.released
          subscription_schedule.updated
        ],
      })
    end
  end
end