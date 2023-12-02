module Api
  module V1
    class ReportsController < BaseController
      def index
        render json: current_workspace.reports, each_serializer: EventTriggerSerializer, status: :ok
      end

      def create
        report = current_workspace.reports.new(
          enabled: true,
          name: params[:name], 
          cadence: params[:cadence], 
          sending_mechanism: params[:sending_mechanism],  
        )
        if report.save
          render json: { trigger: ReportSerializer.new(report) }, status: :ok
        else
          render json: { error: report.errors.full_messages.join(' ') }, status: :unprocessable_entity
        end
      end

      def destroy
        report = current_workspace.report.find_by(id: params[:id])
        if report.present?
          if report.destroy
            render json: { report: ReportSerializer.new(report) }, status: :ok
          else
            render json: { error: report.errors.full_messages.join(' ') }, status: :unprocessable_entity
          end
        else
          render json: { error: 'Report not found' }, status: :not_found
        end
      end

      # def test_trigger
      #   if params[:test_event].blank?
      #     render json: { error: 'Test event payload is required' }, status: :unprocessable_entity
      #     return
      #   end
      #   trigger = current_workspace.event_triggers.find_by(id: params[:id])
      #   if trigger.present?
      #     trigger.trigger!(params[:test_event], as_test: true)
      #     render json: { trigger: EventTriggerSerializer.new(trigger) }, status: :ok
      #   else
      #     render json: { error: 'Trigger not found' }, status: :not_found
      #   end
      # end

      def enable
        report = current_workspace.reports.find_by(id: params[:id])
        if report.present?
          report.update(enabled: true)
          render json: { trigger: ReportSerializer.new(report) }, status: :ok
        else
          render json: { error: 'Report not found' }, status: :not_found
        end
      end

      def disable
        report = current_workspace.reports.find_by(id: params[:id])
        if report.present?
          report.update(enabled: false)
          render json: { report: ReportSerializer.new(report) }, status: :ok
        else
          render json: { error: 'Report not found' }, status: :not_found
        end
      end
    end
  end
end