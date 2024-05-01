module Api
  module V1
    class DashboardDataVisualizationsController < BaseController
      before_action :find_dashboard

      def index
        dashboard_data_visualizations = @dashboard.dashboard_data_visualizations.includes(:data_visualization)
        render json: dashboard_data_visualizations, each_serializer: DashboardDataVisualizationSerializer, status: :ok
      end

      def create
        dashboard_data_vizualization = @dashboard.dashboard_data_visualizations.new(
          data_visualization_id: params[:data_visualization_id],
          position_config: (params[:position_config] || {}).as_json
        )
        if dashboard_data_vizualization.save
          render json: dashboard_data_vizualization, serializer: DashboardDataVisualizationSerializer, status: :ok
        else
          render json: { error: dashboard_data_vizualization.errors.full_messages.join(' ') }, status: :unprocessable_entity
        end
      end

      def destroy
        dashboard_data_vizualization = @dashboard.dashboard_data_visualizations.find(params[:id])
        if dashboard_data_vizualization.destroy
          render json: { dashboard_data_vizualization: dashboard_data_vizualization }, status: :ok
        else
          render json: { error: dashboard_data_vizualization.errors.full_messages.join(' ') }, status: :unprocessable_entity
        end
      end

      def bulk_update
        updated_dashboard_data_visualizations = []
        errors = []
        (params[:dashboard_data_visualizations] || []).each do |dashboard_data_visualization_attrs_to_update|
          dashboard_data_vizualization = @dashboard.dashboard_data_visualizations.find(dashboard_data_visualization_attrs_to_update[:id])
          if dashboard_data_vizualization.update(position_config: dashboard_data_visualization_attrs_to_update[:position_config].as_json)
            updated_dashboard_data_visualizations << { id: dashboard_data_vizualization.id, position_config: dashboard_data_vizualization.position_config }
          else
            errors << dashboard_data_vizualization.errors.full_messages.join(' ')
          end
        end
        render json: { updated_dashboard_data_visualizations: updated_dashboard_data_visualizations, errors: errors }, status: :ok
      end

      private

      def find_dashboard
        @dashboard ||= current_workspace.dashboards.find(params[:dashboard_id])
      end
    end
  end
end