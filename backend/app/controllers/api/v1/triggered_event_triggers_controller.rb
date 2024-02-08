module Api
  module V1
    class TriggeredEventTriggersController < BaseController
      def index
        event_trigger = current_workspace.event_triggers.find_by(id: params[:event_trigger_id])
        if event_trigger.present?
          render json: event_trigger.triggered_event_triggers, each_serializer: TriggeredEventTriggerSerializer, status: :ok
        else
          render json: { error: 'Trigger not found' }, status: :not_found
        end
      end
    end
  end
end