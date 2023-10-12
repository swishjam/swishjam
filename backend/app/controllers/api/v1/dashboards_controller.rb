module Api
  module V1
    class DashboardsController < BaseController
      def show
        dashboard = current_workspace.dashboards.find(params[:id])
        render json: dashboard, status: :ok
      end

      def create
        params[:dashboard] ||= {}
        params[:dashboard][:name] ||= "Untitled"
        dashboard = Dashboard.new(dashboard_params)
        dashboard.workspace = current_workspace
        dashboard.created_by_user = current_user
        dashboard.save!
        render json: { dashboard: dashboard }, status: :ok
      end

      def update
        dashboard = current_workspace.dashboards.find(params[:id])
        if dashboard.update(dashboard_params)
          render json: { dashboard: dashboard }, status: :ok
        else
          render json: { error: dashboard.errors.full_messages.join(' ') }, status: :unprocessable_entity
        end
      end

      private

      def dashboard_params
        params.require(:dashboard).permit(:name)
      end
    end
  end
end