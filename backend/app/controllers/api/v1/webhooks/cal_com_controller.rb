module Api
  module V1
    module Webhooks
      class CalComController < BaseController
        def receive
          if params['triggerEvent'] == 'PING'
            render json: { message: 'ok' }, status: :ok
            return
          end
          
          workspace = Workspace.find_by(id: params[:workspace_id])
          if workspace.nil?
            Sentry.capture_message("Received Cal.com event from workspace #{params[:workspace_id]}, but unable to find matching workspace.")
            render json: { message: 'ok' }, status: :ok
            return
          end

          integration = workspace.integrations.enabled.by_type(Integrations::CalCom).first
          if integration.nil?
            Sentry.capture_message("Received Cal.com event from workspace #{params[:workspace_id]}, but unable to find matching enabled Cal.com integration.")
            render json: { message: 'ok' }, status: :ok
            return
          end

          public_key = workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.CAL_COM).public_key
          if public_key.nil?
            Sentry.capture_message("Received Cal.com event from workspace #{params[:workspace_id]}, but unable to find matching ApiKey record.")
            render json: { message: 'ok' }, status: :ok
            return
          end

          event_to_prepare = Analytics::Event.formatted_for_preparation(
            uuid: params.dig('payload', 'uid') || SecureRandom.uuid,
            swishjam_api_key: public_key,
            name: "cal.#{params[:triggerEvent]}",
            occurred_at: DateTime.parse(params[:createdAt]).to_f,
            properties: params.as_json,
          )
          IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter.perform_async([event_to_prepare])
          render json: { message: 'ok' }, status: :ok
        end
      end
    end
  end
end