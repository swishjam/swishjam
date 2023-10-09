module Api
  module V1
    class WorkspaceSettingsController < BaseController
      def update
        current_workspace.settings.update(
          use_product_data_source_in_lieu_of_marketing: params[:use_product_data_source_in_lieu_of_marketing],
          use_marketing_data_source_in_lieu_of_product: params[:use_marketing_data_source_in_lieu_of_product]
        )
        render json: { settings: current_workspace.settings }, status: :ok
      end
    end
  end
end