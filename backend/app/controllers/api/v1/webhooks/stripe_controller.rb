module Api
  module V1
    module Webhooks
      class StripeController < BaseController
        def receive
          payload = request.body.read
          sig_header = request.env['HTTP_STRIPE_SIGNATURE']

          event = Stripe::Webhook.construct_event(payload, sig_header, ENV['STRIPE_WEBHOOK_SECRET'])
          ProcessStripeEventJob.perform_async(event, params[:account])
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