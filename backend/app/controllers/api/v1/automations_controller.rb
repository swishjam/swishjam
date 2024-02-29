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

      def test_execution
        if params[:id]
          automation = current_workspace.automations.find(params[:id])
          mock_event = Ingestion::ParsedEventFromIngestion.new(
            uuid: params[:test_event_uuid] || SecureRandom.uuid,
            name: params[:test_event_name] || automation.entry_point_event_name,
            swishjam_api_key: current_workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key,
            occurred_at: Time.current,
            properties: (params[:test_event_properties] || { test_property: 'test_value' }).as_json,
          )
          # execute in web request?
          executed_automation = automation.execute!(mock_event, as_test: true)
          render json: { executed_automation: ExecutedAutomationSerializer.new(executed_automation) }, status: :ok
        elsif params[:configuration]
        else
          render json: { error: 'Invalid request' }, status: :bad_request
        end
      end
    end
  end
end