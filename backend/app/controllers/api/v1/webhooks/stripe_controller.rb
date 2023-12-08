module Api
  module V1
    module Webhooks
      class StripeController < BaseController
        def receive
          EventReceivers::Stripe.new(params, request.env['HTTP_STRIPE_SIGNATURE']).receive!
          render json: {}, status: :ok
        end
      end
    end
  end
end