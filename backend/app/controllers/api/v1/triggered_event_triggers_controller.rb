module Api
  module V1
    class TriggeredEventTriggersController < BaseController
      def index
        event_trigger = current_workspace.event_triggers.find_by(id: params[:event_trigger_id])
        if event_trigger.present?
          triggered_event_triggers = event_trigger.triggered_event_triggers
                                                    .includes(:triggered_event_trigger_steps)
                                                    .order(created_at: :DESC)
                                                    .page(params[:page] || 1)
                                                    .per(params[:per_page] || 10)
          render json: { 
            triggered_event_triggers: triggered_event_triggers.map{ |t| TriggeredEventTriggerSerializer.new(t) },
            total_num_pages: triggered_event_triggers.total_pages,
          }, status: :ok
        else
          render json: { error: 'Trigger not found' }, status: :not_found
        end
      end
    end
  end
end