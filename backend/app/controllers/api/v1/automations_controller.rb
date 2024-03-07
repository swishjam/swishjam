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
        ActiveRecord::Base.transaction do
          automation = Automations::Creator.create_automation!(
            workspace: current_workspace,
            name: params[:name],
            automation_steps: params[:automation_steps],
            next_automation_step_conditions: params[:next_automation_step_conditions],
            created_by_user: current_user,
            enabled: true,
          )
          render json: { automation: AutomationSerializer.new(automation) }, status: :created
        end
      rescue ActiveRecord::RecordInvalid, ActiveRecord::NotNullViolation => e
        render json: { error: e.message }, status: :unprocessable_entity
      rescue => e
        render json: { error: e.message }, status: :internal_server_error
      end

      def update
        automation = current_workspace.automations.find(params[:id])
        ActiveRecord::Base.transaction do
          automation = Automations::Updater.update_automation!(
            automation,
            name: params[:name],
            automation_steps: params[:automation_steps],
            next_automation_step_conditions: params[:next_automation_step_conditions],
            enabled: true,
          )
          render json: { automation: AutomationSerializer.new(automation) }, status: :created
        end
      rescue ActiveRecord::RecordInvalid, ActiveRecord::NotNullViolation => e
        render json: { error: e.message }, status: :unprocessable_entity
      rescue => e
        render json: { error: e.message }, status: :internal_server_error
      end

      def test_execution
        # execute in web request?
        if params[:id]
          automation = current_workspace.automations.find(params[:id])
          entry_point_step = automation.automation_steps.find_by(type: AutomationSteps::EntryPoint.to_s)
          mock_event = Ingestion::ParsedEventFromIngestion.new(
            uuid: params[:test_event_uuid] || SecureRandom.uuid,
            name: entry_point_step.event_name,
            swishjam_api_key: current_workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key,
            occurred_at: Time.current,
            properties: (params[:test_event_properties] || { test_property: 'test_value' }).as_json,
          )
          executed_automation = automation.execute!(mock_event, as_test: true)
          render json: { 
            executed_automation: ExecutedAutomationSerializer.new(executed_automation).as_json,
            automation: AutomationSerializer.new(automation).as_json,
          }, status: :ok
        elsif params[:configuration]
          mock_event = Ingestion::ParsedEventFromIngestion.new(
            uuid: params[:test_event_uuid] || SecureRandom.uuid,
            name: params[:test_event_name],
            swishjam_api_key: current_workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key,
            occurred_at: Time.current,
            properties: (params[:test_event_properties] || { test_property: 'test_value' }).as_json,
          )
          automation = Automations::Creator.create_automation!(
            workspace: current_workspace,
            name: "test_automation #{Time.current.to_i}",
            automation_steps: params[:configuration][:automation_steps],
            next_automation_step_conditions: params[:configuration][:next_automation_step_conditions],
            created_by_user: current_user,
            enabled: false,
          )
          executed_automation = automation.execute!(mock_event, as_test: true)
          json = { 
            executed_automation: ExecutedAutomationSerializer.new(executed_automation).as_json,
            # automation: AutomationSerializer.new(automation.reload).as_json,
            automation_steps: automation.automation_steps.map { |step| AutomationStepSerializer.new(step).as_json },
          }
          automation.destroy!
          render json: json, status: :ok
        else
          render json: { error: 'Invalid request' }, status: :bad_request
        end
      end
    end
  end
end