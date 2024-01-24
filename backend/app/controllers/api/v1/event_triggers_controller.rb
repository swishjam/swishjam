module Api
  module V1
    class EventTriggersController < BaseController
      def index
        render json: current_workspace.event_triggers.includes(:event_trigger_steps), each_serializer: EventTriggerSerializer, status: :ok
      end

      def show
        trigger = current_workspace.event_triggers.find_by(id: params[:id])
        if trigger.present?
          render json: { trigger: EventTriggerSerializer.new(trigger) }, status: :ok
        else
          render json: { error: 'Trigger not found' }, status: :not_found
        end
      end

      def update
        trigger = current_workspace.event_triggers.find_by(id: params[:id])
        if trigger.present?
          new_trigger_steps = (params[:event_trigger_steps] || []).map do |step| 
            { 
              type: step[:type], 
              config: JSON.parse((step[:config] || {}).to_json),
            }
          end
          has_valid_trigger_steps = new_trigger_steps.all? do |step|
            step[:type].present? && step[:config].present? && step[:config]['channel_id'].present? && (step[:config]['message_header'].present? || step[:config]['message_body'].present?)
          end
          if !has_valid_trigger_steps
            render json: { error: 'Invalid trigger steps' }, status: :unprocessable_entity
            return
          end
          if trigger.update(event_name: params[:event_name], conditional_statements: (params[:conditional_statements] || []).as_json)
            trigger.event_trigger_steps.destroy_all
            trigger.event_trigger_steps_attributes = new_trigger_steps
            trigger.save
            render json: { trigger: EventTriggerSerializer.new(trigger) }, status: :ok
          else
            render json: { error: trigger.errors.full_messages.join(' ') }, status: :unprocessable_entity
          end
        else
          render json: { error: 'Trigger not found' }, status: :not_found
        end
      end

      def create
        trigger_steps = (params[:event_trigger_steps] || []).map do |step| 
          { 
            type: step[:type], 
            config: JSON.parse((step[:config] || {}).to_json),
          }
        end

        trigger = current_workspace.event_triggers.new(
          enabled: true,
          event_name: params[:event_name], 
          conditional_statements: (params[:conditional_statements] || []).as_json,
          event_trigger_steps_attributes: trigger_steps,
        )
        if trigger.save
          render json: { trigger: EventTriggerSerializer.new(trigger) }, status: :ok
        else
          render json: { error: trigger.errors.full_messages.join(' ') }, status: :unprocessable_entity
        end
      end

      def destroy
        trigger = current_workspace.event_triggers.find_by(id: params[:id])
        if trigger.present?
          if trigger.destroy
            render json: { trigger: EventTriggerSerializer.new(trigger) }, status: :ok
          else
            render json: { error: trigger.errors.full_messages.join(' ') }, status: :unprocessable_entity
          end
        else
          render json: { error: 'Trigger not found' }, status: :not_found
        end
      end

      def test_trigger
        required_params = [:event_name, :conditional_statements, :event_trigger_steps, :event_payload]
        missing_params = required_params.reject{ |param| !params[param].nil? }
        if missing_params.any?
          render json: { error: "Missing required params: #{missing_params.join(', ')}" }, status: :unprocessable_entity
          return
        end
        trigger = EventTrigger.create!(
          workspace: current_workspace,
          enabled: false,
          event_name: params[:event_name],
          conditional_statements: params[:conditional_statements].as_json,
          event_trigger_steps_attributes: params[:event_trigger_steps].map do |step|
            {
              type: step[:type],
              config: JSON.parse((step[:config] || {}).to_json),
            }
          end
        )
        mock_event = { 
          uuid: "mocked-#{SecureRandom.uuid}", 
          name: params[:event_name], 
          swishjam_api_key: 'mocked-api-key',
          properties: params[:event_payload].to_json,
          occurred_at: Time.current,
        }.as_json
        did_trigger = trigger.trigger_if_conditions_are_met!(mock_event, as_test: true)
        trigger.destroy!
        render json: { did_trigger: did_trigger }, status: :ok
      end

      def enable
        trigger = current_workspace.event_triggers.find_by(id: params[:id])
        if trigger.present?
          trigger.update(enabled: true)
          render json: { trigger: EventTriggerSerializer.new(trigger) }, status: :ok
        else
          render json: { error: 'Trigger not found' }, status: :not_found
        end
      end

      def disable
        trigger = current_workspace.event_triggers.find_by(id: params[:id])
        if trigger.present?
          trigger.update(enabled: false)
          render json: { trigger: EventTriggerSerializer.new(trigger) }, status: :ok
        else
          render json: { error: 'Trigger not found' }, status: :not_found
        end
      end
    end
  end
end