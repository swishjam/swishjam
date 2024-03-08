module Api
  module V1
    class AutomationStepsController < BaseController
      before_action :get_automation
      
      def index
        render json: @automation.automation_steps, each_serializer: AutomationStepSerializer, status: :ok
      end

      private

      def get_automation
        @automation ||= current_workspace.automations.find(params[:automation_id])
      end
    end
  end
end