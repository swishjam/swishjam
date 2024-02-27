module Api
  module V1
    class AutomationsController < BaseController
      def index
        render json: current_workspace.automations.page(params[:page] || 1).per(params[:per_page] || 20), status: :ok
      end

      def show
        automation = current_workspace.automations.find(params[:id])
        render json: {
          automation: automation,
          automation_steps: automation.automation_steps.in_sequence_order,
          next_automation_step_conditions: automation.next_automation_step_conditions,
        }, status: :ok
      end

      def create
      end
    end
  end
end