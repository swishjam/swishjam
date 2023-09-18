module Api
  module V1
    class DashboardComponentsController < BaseController
      def create
        component = DashboardComponent.new(component_params)
        component.workspace = current_workspace
        component.created_by_user = current_user
        if component.save
          render json: { dashboard_component: component }, status: :ok
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

      private

      def component_params
        params.require(:dashboard_component).permit(:configuration)
      end
    end
  end
end