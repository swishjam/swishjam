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

      def cancel
        event_trigger = current_workspace.event_triggers.find_by(id: params[:event_trigger_id])
        if !event_trigger.present?
          render json: { error: 'Event Trigger not found' }, status: :not_found
          return
        end
        triggered_event_trigger = event_trigger.triggered_event_triggers.find_by(id: params[:id])
        if !triggered_event_trigger.present?
          render json: { error: 'Triggered Event Trigger not found' }, status: :not_found
          return
        end
        if !triggered_event_trigger.can_cancel?
          render json: { error: 'Cannot cancel event trigger.' }, status: :unprocessable_entity
          return
        end
        if triggered_event_trigger.can_cancel?
          triggered_event_trigger.cancel!(current_user.email)
          render json: TriggeredEventTriggerSerializer.new(triggered_event_trigger).as_json, status: :ok
        else
          render json: { error: 'Cannot cancel event trigger.' }, status: :unprocessable_entity
        end
      end

      def retry
        event_trigger = current_workspace.event_triggers.find_by(id: params[:event_trigger_id])
        if !event_trigger.present?
          render json: { error: 'Event Trigger not found' }, status: :not_found
          return
        end
        triggered_event_trigger = event_trigger.triggered_event_triggers.find_by(id: params[:id])
        if !triggered_event_trigger.present?
          render json: { error: 'Triggered Event Trigger not found' }, status: :not_found
          return
        end
        # this runs in the web request, not a background job
        maybe_new_triggered_event_trigger = triggered_event_trigger.retry!
        render json: {
          provided_triggered_event_trigger: TriggeredEventTriggerSerializer.new(triggered_event_trigger.reload),
          new_triggered_event_trigger_retry: maybe_new_triggered_event_trigger ? TriggeredEventTriggerSerializer.new(maybe_new_triggered_event_trigger) : nil,
          retry_successful: maybe_new_triggered_event_trigger != false,
          error: maybe_new_triggered_event_trigger == false ? "Automation was not triggered because the conditions set on the event trigger was not met." : nil,
        }, status: :ok
      rescue TriggeredEventTrigger::InvalidRetryError => e
        Sentry.capture_exception(e)
        render json: { 
          retry_successful: false,
          error: "This trigger is unable to be retried due to the fact it has already succeeded or has already been successfully retried.",
        }, status: :unprocessable_entity
      end

    end
  end
end