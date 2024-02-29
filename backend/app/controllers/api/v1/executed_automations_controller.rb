module Api
  module V1
    class ExecutedAutomationsController < BaseController
      include TimeseriesHelper
      before_action :get_automation

      def index
        render json: @automation.executed_automations, each_serializer: ExecutedAutomationSerializer, status: :ok
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