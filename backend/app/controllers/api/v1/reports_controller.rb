module Api
  module V1
    class ReportsController < BaseController
      def index
        render json: current_workspace.reports, status: :ok
      end

      def create
        report = current_workspace.reports.new(
          enabled: true,
          name: params[:name], 
          cadence: params[:cadence], 
          sending_mechanism: params[:sending_mechanism],  
          config: JSON.parse(params[:config].to_json),
        )
        if report.save
          render json: { report: report }, status: :ok
        else
          render json: { error: report.errors.full_messages.join(' ') }, status: :unprocessable_entity
        end
      end

      def destroy
        report = current_workspace.reports.find_by(id: params[:id])
        if report.present?
          if report.destroy
            render json: { report: report }, status: :ok
          else
            render json: { error: report.errors.full_messages.join(' ') }, status: :unprocessable_entity
          end
        else
          render json: { error: 'Report not found' }, status: :not_found
        end
      end

      def enable
        report = current_workspace.reports.find_by(id: params[:id])
        if report.present?
          report.update(enabled: true)
          render json: { report: report }, status: :ok
        else
          render json: { error: 'Report not found' }, status: :not_found
        end
      end

      def disable
        report = current_workspace.reports.find_by(id: params[:id])
        if report.present?
          report.update(enabled: false)
          render json: { report: report}, status: :ok
        else
          render json: { error: 'Report not found' }, status: :not_found
        end
      end
    end
  end
end