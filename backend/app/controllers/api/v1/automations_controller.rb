module Api
  module V1
    class AutomationsController < BaseController
      def index
        render json: current_workspace.automations.page(params[:page] || 1).per(params[:per_page] || 20), status: :ok
      end

      def show
        render json: current_workspace.automations.find(params[:id]), status: :ok
      end

      def create
      end
    end
  end
end