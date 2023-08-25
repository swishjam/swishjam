module Api
  module V1
    class IntegrationsController < BaseController
      before_action :get_integration, only: [:show, :enable, :disable, :destroy]

      def index
        enabled_integrations = current_workspace.integrations.enabled
        disabled_integrations = current_workspace.integrations.disabled
        available_integrations = Integration.TYPES - enabled_integrations.collect(&:class) - disabled_integrations.collect(&:class)
        render json: { 
          enabled_integrations: enabled_integrations.collect{ |integration| { name: integration.class.friendly_name, enabled: true, id: integration.id }},
          disabled_integrations: disabled_integrations.collect{ |integration| { name: integration.class.friendly_name, enabled: false, id: integration.id }},
          available_integrations: available_integrations.collect{ |integration| { name: integration.friendly_name, type: integration.to_s }}
        }, status: :ok
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

    end
  end
end