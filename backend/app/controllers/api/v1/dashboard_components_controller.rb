module Api
  module V1
    class DashboardComponentsController < BaseController
      def index
        if params[:dashboard_id]
          dashbaord_components = current_workspace.dashboards.includes(:dashboard_components).find(params[:dashboard_id]).dashboard_components
          render json: dashbaord_components, each_serializer: DashboardComponentsSerializer, status: :ok
        else
          render json: current_workspace.dashboard_components, each_serializer: DashboardComponentsSerializer, status: :ok
        end
      end

      def create
        component = DashboardComponent.new(configuration: params.dig(:dashboard_component).dig(:configuration))
        component.workspace = current_workspace
        component.created_by_user = current_user
        if component.save
          if params[:dashboard_id]
            dashboard = current_workspace.dashboards.find(params[:dashboard_id])
            dashboard.dashboard_components << component
          end  
          render json: component, serializer: DashboardComponentsSerializer, status: :ok
        else
          render json: { error: component.errors.full_messages.join(' ') }, status: :unprocessable_entity
        end
      end

      def update
        component = current_workspace.dashboard_components.find(params[:id])
        if component.update(component_params)
          render json: { dashboard_component: component }, status: :ok
        else
          render json: { error: component.errors.full_messages.join(' ') }, status: :unprocessable_entity
        end
      end

      def bulk_update
        components = current_workspace.dashboard_components.where(id: params[:ids])
        updated_components = []
        errors = []
        components.each do |component|
          if component.update(component_params)
            updated_components << component
          else
            errors << component.errors.full_messages.join(' ')
          end
        end
        render json: { 
          updated_components: updated_components,
          errors: errors
        }, status: :ok
      end

      private

      def component_params
        params.require(:dashboard_component).permit(:configuration)
      end
    end
  end
end