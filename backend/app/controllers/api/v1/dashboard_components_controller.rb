module Api
  module V1
    class DashboardComponentsController < BaseController
      def index
        if params[:dashboard_id]
          dashboard_components = current_workspace.dashboards.includes(:dashboard_components).find(params[:dashboard_id]).dashboard_components
          render json: dashboard_components, each_serializer: DashboardComponentSerializer, status: :ok
        else
          render json: current_workspace.dashboard_components, each_serializer: DashboardComponentSerializer, status: :ok
        end
      end

      def create
        component = current_workspace.dashboard_components.new(
          title: params[:title], 
          subtitle: params[:subtitle], 
          configuration: (params[:configuration] || {}).as_json,
          created_by_user: current_user,
        )
        if component.save
          if params[:dashboard_id]
            dashboard = current_workspace.dashboards.find(params[:dashboard_id])
            dashboard.dashboard_components << component
          end  
          render json: component, serializer: DashboardComponentSerializer, status: :ok
        else
          render json: { error: component.errors.full_messages.join(' ') }, status: :unprocessable_entity
        end
      end

      def bulk_create
        dashboard = current_workspace.dashboards.find(params[:dashboard_id])
        errors = []
        new_components = []
        params[:dashboard_components].each do |dashboard_component_params|
          component = DashboardComponent.new(configuration: dashboard_component_params[:configuration])
          component.workspace = current_workspace
          component.created_by_user = current_user
          if component.save
            dashboard.dashboard_components << component
            new_components << component
          else
            errors << component.errors.full_messages.join(' ')
          end
        end
        render json: { errors: errors, new_components: new_components.map{ |c| DashboardComponentSerializer.new(a) }}
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
        updated_components = []
        errors = []
        (params[:dashboard_components] || []).each do |updated_component_attributes|
          component = current_workspace.dashboard_components.find(updated_component_attributes[:id])
          if component.update(configuration: updated_component_attributes[:configuration].as_json)
            updated_components << DashboardComponentSerializer.new(component).as_json
          else
            errors << component.errors.full_messages.join(' ')
          end
        end
        render json: { updated_components: updated_components, errors: errors }, status: :ok
      end

      def destroy
        component = current_workspace.dashboard_components.find(params[:id])
        if component.destroy
          render json: { dashboard_component: component }, status: :ok
        else
          render json: { error: component.errors.full_messages.join(' ') }, status: :unprocessable_entity
        end
      end

      private

      def component_params
        params.require(:dashboard_component).permit(:title, :subtitle, :configuration)
      end
    end
  end
end