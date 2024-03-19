module Api
  module V1
    module Webhooks
      class IntercomController < BaseController
        def receive
          integration = Integrations::Intercom.find_by_app_id(params[:app_id])
          if integration.nil?
            Sentry.capture_message("Received Intercom event from app #{params[:app_id]}, but unable to find matching enabled Intercom integration record.", level: 'error')
            render json: {}, status: :ok
            return
          end

          public_key = integration.workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.INTERCOM)&.public_key
          if public_key.nil?
            Sentry.capture_message("Received Intercom event from app #{params[:app_id]}, but unable to find `ApiKey` for Integration record (#{integration.id}).", level: 'error')
            render json: {}, status: :ok
            return
          end

          formatted_event = Analytics::Event.formatted_for_preparation(
            uuid: params[:id],
            swishjam_api_key: public_key, 
            name: "intercom.#{params[:topic]}",
            occurred_at: Time.at(params[:created_at]).to_datetime.to_f,
            properties: params.as_json,
          )
          IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter.perform_async([formatted_event])
          render json: {}, status: :ok
        end
      end
    end
  end
end