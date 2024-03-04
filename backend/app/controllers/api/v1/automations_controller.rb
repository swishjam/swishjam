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
        byebug
        client_id_to_step_id_map = {}
        ActiveRecord::Base.transaction do
          automation = current_workspace.automations.create!(
            name: params[:name],
            # entry_point_event_name: params[:entry_point_event_name],
            entry_point_event_name: "stubbed!",
            enabled: params[:enabled],
            created_by_user: current_user,
          )
          automation_steps = params[:automation_steps].map do |step_params|
            step = automation.automation_steps.create!(
              automation: automation,
              type: step_params[:type],
              config: step_params[:config],
              sequence_index: 0,
            )
            client_id_to_step_id_map[step_params[:client_id]] = step.id
            step
          end
          next_automation_step_conditions = params[:next_automation_step_conditions].map do |condition_params|
            step_id = client_id_to_step_id_map[condition_params[:automation_step_client_id]]
            next_automation_step_id = client_id_to_step_id_map[condition_params[:next_automation_step_client_id]]
            byebug
            NextAutomationStepCondition.create!(
              automation_step_id: step_id, 
              next_automation_step_id: next_automation_step_id,
              next_automation_step_condition_rules_attributes: condition_params[:next_automation_step_condition_rules] || [],
            )
          end
          render json: { automation: AutomationSerializer.new(automation) }, status: :created
        end
      rescue ActiveRecord::RecordInvalid, ActiveRecord::NotNullViolation => e
        byebug
        render json: { error: e.message }, status: :unprocessable_entity
      rescue => e
        byebug
        render json: { error: e.message }, status: :internal_server_error
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