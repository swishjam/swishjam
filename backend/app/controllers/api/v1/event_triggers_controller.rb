module Api
  module V1
    class EventTriggersController < BaseController
      def index
        if params[:type]
          render json: current_workspace.event_triggers.where(type: params[:type]), status: :ok
        else
          render json: current_workspace.event_triggers, status: :ok
        end
      end

      def create
        trigger = current_workspace.event_triggers.new(
          event_name: params[:event_name], 
          event_trigger_steps: params[:event_trigger_steps],
        )
        if trigger.save
          render json: { trigger }, status: :ok
        else
          render json: { error: trigger.errors.full_messages.join(' ') }, status: :unprocessable_entity
        end
      end
    end
  end
end