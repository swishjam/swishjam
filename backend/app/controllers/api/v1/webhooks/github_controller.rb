module Api
  module V1
    module Webhooks
      class GithubController < BaseController
        def receive
          EventReceivers::Github.new(
            event_type: request.headers['X-GitHub-Event'], 
            event_uuid: request.headers['X-GitHub-Delivery'],
            payload: params
          ).receive!
          render json: { message: 'OK' }, status: :ok
        end
      end
    end
  end
end