module Api
  module V1
    class WorkspaceSettingsController < BaseController
      def update
        current_workspace.settings.update(
          combine_marketing_and_product_data_sources: params[:combine_marketing_and_product_data_sources],
          should_enrich_user_profile_data: params[:should_enrich_user_profile_data],
          should_enrich_organization_profile_data: params[:should_enrich_organization_profile_data],
          enrichment_provider: params[:enrichment_provider],
        )
        render json: { settings: WorkspaceSettingsSerializer.new(current_workspace.settings) }, status: :ok
      end
    end
  end
end