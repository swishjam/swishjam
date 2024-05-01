module Api
  module V1
    class DataVisualizationsController < BaseController
      def index
        if params[:dashboard_id]
          data_visualizations_for_dashboard = current_workspace.dashboards.includes(:data_visualizations).find(params[:dashboard_id]).data_visualizations
          render json: data_visualizations_for_dashboard, each_serializer: DataVisualizationSerializer, status: :ok
        else
          render json: current_workspace.data_visualizations, each_serializer: DataVisualizationSerializer, status: :ok
        end
      end

      def show
        data_viz = current_workspace.data_visualizations.find(params[:id])
        render json: data_viz, serializer: DataVisualizationSerializer, status: :ok
      end

      def create
        data_visualization = current_workspace.data_visualizations.new(
          title: params[:title], 
          subtitle: params[:subtitle], 
          visualization_type: params[:visualization_type],
          config: (params[:config] || {}).as_json,
          created_by_user: current_user,
        )
        if data_visualization.save
          render json: data_visualization, serializer: DataVisualizationSerializer, status: :ok
        else
          render json: { error: data_visualization.errors.full_messages.join(' ') }, status: :unprocessable_entity
        end
      end

      def update
        dashboard_visualization = current_workspace.data_visualizations.find(params[:id])
        if data_visualization.update(
          title: params[:title], 
          subtitle: params[:subtitle], 
          configuration: (params[:configuration] || {}).as_json,
          visualization_type: params[:visualization_type],
        )
          render json: dashboard_visualization, serializer: DataVisualizationSerializer, status: :ok
        else
          render json: { error: dashboard_visualization.errors.full_messages.join(' ') }, status: :unprocessable_entity
        end
      end

      def destroy
        component = current_workspace.dashboard_visualizations.find(params[:id])
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