module Api
  module V1
    module Webhooks
      class ResendController < BaseController
        def receive
          EventReceivers::Resend.new(params[:workspace_id], event_payload).receive!
          render json: { message: 'ok' }, status: :ok
        end
      end
    end
  end
end