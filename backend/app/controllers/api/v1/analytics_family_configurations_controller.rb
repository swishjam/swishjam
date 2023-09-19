module Api
  module V1
    class AnalyticsFamilyConfigurationsController < BaseController
      def index
        render json: current_workspace.analytics_family_configurations, each_serializer: AnalyticsFamilyConfigurationSerializer, status: :ok
      end

      def create
        analytics_family_configuration = current_workspace.analytics_family_configurations.new(analytics_family_configuration_params)
        if analytics_family_configuration.save
          render json: { 
            analytics_family_configuration: analytics_family_configuration,
            analytics_family_configurations: current_workspace.reload.analytics_family_configurations.map{ |afc| AnalyticsFamilyConfigurationSerializer.new(afc) }
          }, status: :created
        else
          render json: { error: analytics_family_configuration.errors.full_messages.join('. ')}, status: :unprocessable_entity
        end
      end

      def destroy
        analytics_family_configuration = current_workspace.analytics_family_configurations.find(params[:id])
        if analytics_family_configuration.destroy
          render json: { 
            analytics_family_configuration: analytics_family_configuration,
            analytics_family_configurations: current_workspace.reload.analytics_family_configurations.map{ |afc| AnalyticsFamilyConfigurationSerializer.new(afc) }
          }, status: :ok
        else
          render json: { error: analytics_family_configuration.errors.full_messages.join('. ')}, status: :unprocessable_entity
        end
      end

      private

      def analytics_family_configuration_params
        params.require(:analytics_family_configuration).permit(:type, :description, :url_regex)
      end
    end
  end
end