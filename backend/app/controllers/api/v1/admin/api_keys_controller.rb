module Api
  module V1
    module Admin
      class ApiKeysController < BaseController
        def workspace_for_api_key
          api_key = ApiKey.find_by(public_key: params[:public_key])
          render json: api_key&.workspace || {}, status: :ok
        end
      end
    end
  end
end