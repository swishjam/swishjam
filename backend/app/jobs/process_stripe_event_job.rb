class ProcessStripeEventJob
  include Sidekiq::Job
  queue_as :default

  def perform(stripe_event_json, stripe_account_id)
    if stripe_account_id.nil?
      Sentry.capture_message("Received a ProcessStripeEventJob without a Stripe Account ID.")
      Rails.logger.error "Received a ProcessStripeEventJob without a Stripe Account ID."
    else
      stripe_event = Stripe::Event.construct_from(stripe_event_json)
      integration = Integrations::Stripe.find_by("config->>'account_id' = ?", stripe_account_id)
      if integration
        swishjam_event_data = StripeHelpers::WebhookEventParser.event_attributes_for(stripe_event)
        public_key = integration.workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.STRIPE).public_key
        CaptureAnalyticDataJob.perform_async(public_key, [swishjam_event_data], nil)
      else
        Sentry.capture_message("Unable to find Stripe integration for account: #{stripe_account_id}")
        Rails.logger.error "Unable to find Stripe integration for account: #{stripe_account_id}"
      end
    end
  end
end