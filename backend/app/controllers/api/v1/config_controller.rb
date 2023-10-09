module Api
  module V1
    class ConfigController < BaseController
      def index
        render json: {
          workspace: current_workspace,
          api_keys: current_workspace.api_keys.map { |key| ApiKeySerializer.new(key) },
          settings: WorkspaceSettingsSerializer.new(current_workspace.settings)
        }, status: :ok
      end
    end
  end
end