module Api
  module V1
    class IntegrationsController < BaseController
      before_action :get_integration, only: [:show, :enable, :disable, :destroy]

      def index
        if params[:destinations] == 'true'
          enabled_destinations = current_workspace.integrations.destinations.enabled
          disabled_destinations = current_workspace.integrations.destinations.disabled
          available_destinations = Integration.DESTINATION_TYPES - enabled_destinations.collect(&:class) - disabled_destinations.collect(&:class)
          render json: {
            enabled_integrations: enabled_destinations.collect{ |destination| { name: destination.class.friendly_name, enabled: true, id: destination.id }},
            disabled_integrations: disabled_destinations.collect{ |destination| { name: destination.class.friendly_name, enabled: false, id: destination.id }},
            available_integrations: available_destinations.collect{ |destination| { name: destination.friendly_name, type: destination.to_s }}
          }, status: :ok
        else
          default_integrations = [
            { name: 'Swishjam - Web Analytics', enabled: true, id: 'web_analytics', cannot_manage: true },
            { name: 'Swishjam - Product Analytics', enabled: true, id: 'product_analytics', cannot_manage: true },
          ]
          enabled_integrations = current_workspace.integrations.data_sources.enabled
          disabled_integrations = current_workspace.integrations.data_sources.disabled
          available_integrations = Integration.DATA_SOURCE_TYPES - enabled_integrations.collect(&:class) - disabled_integrations.collect(&:class)
          render json: { 
            enabled_integrations: enabled_integrations.collect{ |integration| { name: integration.class.friendly_name, enabled: true, id: integration.id }}.concat(default_integrations),
            disabled_integrations: disabled_integrations.collect{ |integration| { name: integration.class.friendly_name, enabled: false, id: integration.id }},
            available_integrations: available_integrations.collect{ |integration| { name: integration.friendly_name, type: integration.to_s }}
          }, status: :ok
        end
      end

      def create
        integration = current_workspace.integrations.new(
          type: params[:type], 
          config: JSON.parse((params[:config] || {}).to_json),
          enabled: params[:enabled]
        )
        if integration.save
          json = { integration: integration }
          if params[:return_private_key]
            json[:private_key] = current_workspace.api_keys.for_data_source!(integration.class.data_source).private_key
          end
          render json: json, status: :ok
        else
          render json: { error: integration.errors.full_messages.join(' ') }, status: :unprocessable_entity
        end
      end

      def enable
        if @integration.enable!
          render json: {
            success: true,
            message: "Integration is now enabled."
          }, status: :ok
        else
          render json: {
            success: false,
            message: @integration.errors.full_messages.join(', ')
          }, status: :unprocessable_entity
        end
      end

      def disable
        if @integration.disable!
          render json: {
            success: true,
            message: "Integration is now disabled."
          }, status: :ok
        else
          render json: {
            success: false,
            message: @integration.errors.full_messages.join(', ')
          }, status: :unprocessable_entity
        end
      end

      def destroy
        if @integration.destroy
          render json: { 
            success: true,
            message: 'Integration deleted',
          }, status: :ok
        else
          render json: {
            success: false,
            message: @integration.errors.full_messages.join(', ')
          }, status: :unprocessable_entity
        end
      end

      private

      def get_integration
        @integration = current_workspace.integrations.find(params[:id])
        if !@integration
          return render json: { success: false, message: "Integration not found." }, status: :not_found
        end
      end

      def integration_params
        params.require(:integration).permit(:type, :workspace_id, :config, :enabled)
      end
    end
  end
end