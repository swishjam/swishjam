module Api
  module V1
    module Webhooks
      class IntercomController < BaseController
        def receive
          EventReceivers::Intercom.new(request.body.read).receive!
          render json: {}, status: :ok
        end
      end
    end
  end
end