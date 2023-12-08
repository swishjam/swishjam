module Api
  module V1
    module Webhooks
      class CalComController < BaseController
        def receive
          EventReceivers::CalCom.new(params[:workspace_id], params).receive!
          render json: { message: 'ok' }, status: :ok
        end
      end
    end
  end
end