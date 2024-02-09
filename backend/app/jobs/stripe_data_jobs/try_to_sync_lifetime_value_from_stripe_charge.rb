module StripeDataJobs
  class TryToSyncLifetimeValueFromStripeCharge 
    class FailedUpdateError < StandardError; end

    include Sidekiq::Worker
    queue_as :default

    def perform(stripe_charge_id, stripe_account_id)
      raise NotImplementedError, "This job is deprecated."
      integration = Integrations::Stripe.find_by_account_id(stripe_account_id)
      raise FailedUpdateError, "Unable to find `Integrations::Stripe` with Stripe Account ID #{stripe_account_id}, skipping `UpdateLifetimeValueFromStripeCharge`" if !integration
      raise FailedUpdateError, "Integration with Stripe Account ID #{stripe_account_id} is not enabled, skipping `UpdateLifetimeValueFromStripeCharge`" if !integration.enabled?
      
      workspace = integration.workspace
      stripe_charge = Stripe::Charge.retrieve(
        { id: stripe_charge_id, expand: ['customer'] },
        { stripe_account: stripe_account_id }
      )
      customer_profile = workspace.analytics_user_profiles.find_by(email: stripe_charge.customer.email)
      if customer_profile
        customer_profile.lifetime_value_in_cents += (stripe_charge.amount - stripe_charge.amount_refunded)
        customer_profile.save!
      else
        Sentry.capture_message("Could not find a matching user profile for stripe customer with email #{stripe_charge.customer.email} in workspace #{workspace.name} (#{workspace.id}), skipping `UpdateLifetimeValueFromStripeCharge`")
      end
    end
  end
end