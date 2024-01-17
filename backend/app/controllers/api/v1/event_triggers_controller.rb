module Api
  module V1
    class EventTriggersController < BaseController
      def index
        render json: current_workspace.event_triggers.includes(:event_trigger_steps), each_serializer: EventTriggerSerializer, status: :ok
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