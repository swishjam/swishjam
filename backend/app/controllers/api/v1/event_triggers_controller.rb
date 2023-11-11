module Api
  module V1
    class EventTriggersController < BaseController
      def index
        render json: current_workspace.event_triggers, status: :ok
      end

      def create
        byebug
        trigger_steps = (params[:event_trigger_steps] || []).map do |step| 
          { 
            type: step[:type], 
            config: JSON.parse((step[:config] || {}).to_json)
          }
        end

        trigger = current_workspace.event_triggers.new(
          event_name: params[:event_name], 
          event_trigger_steps_attributes: trigger_steps,
        )
        if trigger.save
          render json: { trigger: trigger }, status: :ok
        else
          render json: { error: trigger.errors.full_messages.join(' ') }, status: :unprocessable_entity
        end
      end
    end
  end
end