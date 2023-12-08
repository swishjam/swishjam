module Api
  module V1
    module Webhooks
      class StripeController < BaseController
        def receive
          integration = Integrations::Stripe.includes(:workspace).where("config->>'account_id' = ? AND enabled = ?", params[:account], true).first
          if integration.nil?
            Sentry.capture_message("Received Stripe webhook from Stripe account #{params[:account]}, but unable to find matching enabled Stripe integration record.")
            render json: {}, status: :ok
            return
          end
          
          stripe_event = Stripe::Webhook.construct_event(request.body.read, request.env['HTTP_STRIPE_SIGNATURE'], ENV['STRIPE_WEBHOOK_SECRET'])
          public_key = integration.workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.STRIPE)&.public_key

          if public_key
            stripe_customer = nil
            if stripe_event.data.object&.customer.is_a?(String) && !ENV['STRIPE_SKIP_CUSTOMER_LOOKUP']
              stripe_customer = Stripe::Customer.retrieve(stripe_event.data.object.customer, { stripe_account: params[:account] })
            end
            swishjam_event_data = StripeHelpers::WebhookEventParser.event_attributes_for(stripe_event, integration.workspace, stripe_customer)
            formatted_event = Analytics::Event.formatted_for_ingestion(
              uuid: swishjam_event_data['uuid'],
              swishjam_api_key: public_key,
              name: swishjam_event_data['event'],
              occurred_at: Time.at(swishjam_event_data['timestamp'] / 1_000),
              properties: swishjam_event_data.except('uuid', 'event', 'timestamp'),
            )
            Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, [formatted_event])
            
            # there's other subscription events, but I think these are the only ones we care about
            if %w[customer.subscription.created customer.subscription.updated customer.subscription.deleted].include?(stripe_event.type)
              StripeDataJobs::TryToSyncCustomerSubscriptionFromStripeSubscription.perform_async(stripe_event.data.object.id, params[:account])
            elsif %w[charge.succeeded charge.refunded].include?(stripe_event.type)
              StripeDataJobs::TryToSyncLifetimeValueFromStripeCharge.perform_async(stripe_event.data.object.id, params[:account])
            end
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