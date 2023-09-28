module Api
  module V1
    class ConfigController < BaseController
      def index
        render json: {
          workspace: current_workspace,
          api_keys: current_workspace.api_keys.map { |key| ApiKeySerializer.new(key) }
        }, status: :ok
      end
    end
  end
end