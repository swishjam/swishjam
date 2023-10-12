module Api
  module V1
    class WorkspaceSettingsController < BaseController
      def update
        current_workspace.settings.update(
          combine_marketing_and_product_data_sources: params[:combine_marketing_and_product_data_sources]
        )
        render json: { settings: current_workspace.settings }, status: :ok
      end
    end
  end
end