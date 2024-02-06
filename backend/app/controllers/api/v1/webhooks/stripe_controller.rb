module Api
  module V1
    module Webhooks
      class StripeController < BaseController
        def receive
          stripe_event = ::Stripe::Webhook.construct_event(request.body.read, request.env['HTTP_STRIPE_SIGNATURE'], ENV['STRIPE_WEBHOOK_SECRET'])
          if stripe_event.respond_to?(:account) && stripe_event.account.present? && stripe_event.livemode
            integration = Integrations::Stripe.includes(:workspace).enabled.find_by_config_attribute("account_id", stripe_event.account)
            swishjam_api_key = integration.workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.STRIPE)&.public_key
            event_to_prepare = Ingestion::EventsPreparer.format_for_events_to_prepare_queue(
              uuid: stripe_event.id,
              swishjam_api_key: swishjam_api_key,
              name: "stripe.#{stripe_event.type}",
              occurred_at: stripe_event.created,
              properties: stripe_event.as_json,
            )
            IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter.perform_async([event_to_prepare])
          end
          render json: {}, status: :ok
        end
      end
    end
  end
end