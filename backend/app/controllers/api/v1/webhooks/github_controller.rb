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

# access tokens?
# {"token"=>"ghs_34c2wyXbAQuWvcVtNYTNnyGPZw2Gjq2l0rp1", "expires_at"=>"2023-12-24T00:51:15Z", "permissions"=>{"deployments"=>"read", "issues"=>"read", "metadata"=>"read", "pull_requests"=>"read", "repository_hooks"=>"write", "statuses"=>"read"}, "repository_selection"=>"all"}

# #<ActionController::Parameters {"code"=>"69461703abba5e841a1c", "installation_id"=>"45417878", "setup_action"=>"install", "controller"=>"oauth/github", "action"=>"callback"} permitted: false>