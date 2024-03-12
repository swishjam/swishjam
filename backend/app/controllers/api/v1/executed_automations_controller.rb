module Api
  module V1
    class ExecutedAutomationsController < BaseController
      include TimeseriesHelper
      before_action :get_automation

      def index
        executed_automations = @automation.executed_automations.order(started_at: :DESC).page(params[:page] || 1).per(params[:per_page] || params[:limit] || 20)
        render json: { 
          executed_automations: executed_automations.map{ |ea| ExecutedAutomationSerializer.new(ea) }, 
          total_num_pages: executed_automations.total_pages,
        }, status: :ok
      end

      def timeseries
        timeseries = formated_groupdate_timeseries(timestamp_column: :started_at) { @automation.executed_automations }
        render json: { timeseries: timeseries, start_time: 30.days.ago, end_time: Time.current }, status: :ok
      end

      private

      def get_automation
        @automation ||= Automation.find(params[:automation_id])
      end
    end
  end
end