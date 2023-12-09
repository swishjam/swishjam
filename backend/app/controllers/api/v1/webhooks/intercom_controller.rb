module Api
  module V1
    module Webhooks
      class IntercomController < BaseController
        def receive
          byebug
          # params[:topic]
          render json: {}, status: :ok
        end
      end
    end
  end
end