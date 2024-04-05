module Api
  module V1
    class ExecutedAutomationsController < BaseController
      include TimeseriesHelper
      before_action :get_automation

      def index
        executed_automations = nil
        if params[:automation_step_ids].present?
          executed_automations = @automation.executed_automations
                                              .includes(:executed_on_user_profile)
                                              .that_executed_all_automation_steps(params[:automation_step_ids].split(','))
                                              .order(started_at: :DESC)
                                              .page(params[:page] || 1)
                                              .per(params[:per_page] || params[:limit] || 20)
        else
          executed_automations = @automation.executed_automations
                                              .includes(:executed_on_user_profile)
                                              .order(started_at: :DESC)
                                              .page(params[:page] || 1)
                                              .per(params[:per_page] || params[:limit] || 20)
        end
        render json: { 
          executed_automations: executed_automations.map{ |ea| ExecutedAutomationListItemSerializer.new(ea) },
          total_num_pages: executed_automations.total_pages,
        }, status: :ok
      end
      
      def show
        executed_automation = @automation.executed_automations.find(params[:id])
        render json: { executed_automation: ExecutedAutomationSerializer.new(executed_automation) }, status: :ok
      end

      def timeseries
        timeseries = formated_groupdate_timeseries(timestamp_column: :started_at) { @automation.executed_automations }
        render json: { timeseries: timeseries, start_time: 30.days.ago, end_time: Time.current }, status: :ok
      end

      private

      def get_automation
        @automation ||= current_workspace.automations.find(params[:automation_id])
      end
    end
  end
end