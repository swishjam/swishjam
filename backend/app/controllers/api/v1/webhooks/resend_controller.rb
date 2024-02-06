module Api
  module V1
    module Webhooks
      class ResendController < BaseController
        def receive
          workspace = Workspace.find_by(id: params[:workspace_id])
          if workspace.nil?
            Sentry.capture_message("Received Resend event for workspace #{params[:workspace_id]}, but unable to find matching workspace record.", level: 'error')
            render json: { message: 'ok' }, status: :ok
            return
          end

          swishjam_api_key = workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.RESEND)&.public_key
          if swishjam_api_key.nil?
            Sentry.capture_message("Received Resend event for workspace #{params[:workspace_id]}, but unable to find `ApiKey` for Resend data source.", level: 'error')
            render json: { message: 'ok' }, status: :ok
            return
          end
          
          # email_id is not unique, an email can be `email.delivery_delayed` can occur multiple times (I think..)
          uuid = ['email.sent', 'email.delivered', 'email.bounced'].include?(params['type']) ? params.dig('data', 'email_id') : "#{params.dig('data', 'email_id')}-#{SecureRandom.hex(4)}"
          event_to_prepare = Ingestion::EventsPreparer.format_for_events_to_prepare_queue(
            uuid: "#{params['type']}_#{uuid}",
            swishjam_api_key: swishjam_api_key,
            name: "resend.#{params['type']}",
            occurred_at: DateTime.parse(params.dig('data', 'created_at')),
            properties: params.as_json,
          )
          IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter.perform_async([event_to_prepare])
          render json: { message: 'ok' }, status: :ok
        end
      end
    end
  end
end