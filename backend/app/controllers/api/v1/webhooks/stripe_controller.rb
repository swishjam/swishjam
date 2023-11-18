module Api
  module V1
    module Webhooks
      class StripeController < BaseController
        def receive
          payload = request.body.read
          stripe_event = Stripe::Webhook.construct_event(payload, request.env['HTTP_STRIPE_SIGNATURE'], ENV['STRIPE_WEBHOOK_SECRET'])
          public_key = Integrations::Stripe.joins(workspace: :api_keys)
                                              .where("
                                                integrations.config->>'account_id' = ? AND 
                                                integrations.enabled = ? AND
                                                api_keys.data_source = ?
                                              ", params[:account], true, ApiKey::ReservedDataSources.STRIPE)
                                              .pluck('api_keys.public_key')
                                              .first
          if public_key
            swishjam_event_data = StripeHelpers::WebhookEventParser.event_attributes_for(stripe_event)
            formatted_event = Analytics::Event.formatted_for_ingestion(
              uuid: swishjam_event_data['uuid'],
              swishjam_api_key: public_key,
              name: swishjam_event_data['event'],
              occurred_at: Time.at(swishjam_event_data['timestamp'] / 1_000),
              properties: swishjam_event_data.except('uuid', 'event', 'event_name', 'name', 'timestamp', 'source'),
            )
            Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, [formatted_event])
          else
            Sentry.capture_message("Received Stripe webhook from account #{params[:account]}, but unable to find matching enabled Stripe integration record.")
          end
          render json: {}, status: :ok
        rescue => e
          Sentry.capture_exception(e)
          Rails.logger.error "Unable to process Stripe Webhook: #{e.inspect}"
          render json: {}, status: :unprocessable_entity
        end
      end
    end
  end
end