class UpdateLifetimeValueFromStripeChargeJob 
  class FailedUpdateError < StandardError; end
  include Sidekiq::Worker
  queue_as :default

  def perform(stripe_account_id:, stripe_charge_id:)
    integration = Integrations::Stripe.includes(:workspace).where("integrations.config->>'stripe_account_id' = ?", stripe_account_id).limit(1).first
    raise FailedUpdateError, "Unable to find `Integrations::Stripe` with Stripe Account ID #{stripe_account_id}, skipping `UpdateLifetimeValueFromStripeChargeJob`" if !integration
    raise FailedUpdateError, "Integration with Stripe Account ID #{stripe_account_id} is not enabled, skipping `UpdateLifetimeValueFromStripeChargeJob`" if !integration.enabled?
    
    workspace = integration.workspace
    stripe_charge = Stripe::Charge.retrieve(
      { id: stripe_charge_id, expand: ['customer'] },
      { stripe_account: stripe_account_id }
    )
    customer_profile = workspace.analytics_user_profiles.find_by(email: stripe_charge.customer.email)
    if customer_profile
      customer_profile.lifecycle_value_in_cents += stripe_charge.amount
      customer_profile.save!
    else
      Sentry.capture_message("Could not find a matching user profile for stripe customer with email #{stripe_charge.customer.email} in workspace #{workspace.name} (#{workspace.id}), skipping `UpdateLifetimeValueFromStripeChargeJob`")
    end
  end
end