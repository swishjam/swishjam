module Api
  module V1
    class CaptureController < ApplicationController
      def process_data
        api_key = request.headers['X-Swishjam-Api-Key']
        if api_key.blank?
          render json: { error: 'Swishjam API Key not present, please provide it in the X-Swishjam-Api-Key header.' }, status: :bad_request
          return
        end

        payload = nil
        begin
          payload = JSON.parse(request.body.read || '{}')
        rescue JSON::ParserError => e
          Sentry.capture_exception(e)
          render json: { error: "Invalid JSON payload provided." }, status: :bad_request
          return
        end
        payload = [payload] if payload.is_a?(Hash)
          
        if !payload.is_a?(Array)
          msg = "Invalid payload format. Request body must be an event hash or an array of event hashes."
          Sentry.capture_message(msg)
          render json: { error: msg }, status: :bad_request
          return
        end

        if !ENV['BYPASS_API_KEY_CHECKS_DURING_INGESTION'].present? && !ApiKey.enabled.where(public_key: api_key).exists?
          msg = "Invalid Swishjam API Key provided to capture endpoint: #{api_key}."
          Sentry.capture_message(msg)
          render json: { error: msg }, status: :unauthorized
          return
        end

        events = payload.map do |e|
          Ingestion::EventsPreparer.format_for_events_to_prepare_queue(
            uuid: e['uuid'] || "evt-#{SecureRandom.uuid}",
            swishjam_api_key: api_key,
            name: e['event'] || e['name'],
            occurred_at: e['timestamp'] || Time.current.to_f,
            properties: e['attributes'] || e['properties'] || e.except('uuid', 'event', 'event_name', 'name', 'timestamp', 'source'),
          )
        end

        if events.length > (ENV['MAX_EVENTS_IN_CAPTURE_REQUEST'] || 100).to_i
          msg = "Invalid payload format. Cannot send more than #{ENV['MAX_EVENTS_IN_CAPTURE_REQUEST'] || 100} events in one request."
          Sentry.capture_message(msg)
          render json: { error: msg }, status: :bad_request
          return
        end
        
        if events.any? { |e| e[:name].blank? }
          msg = "Invalid payload format. Event name is required for each event."
          Sentry.capture_message(msg)
          render json: { error: msg }, status: :bad_request
          return
        end

        IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter.perform_async(events)
        render json: { message: 'ok' }, status: :ok
      rescue => e
        Ingestion::QueueManager.push_records_into_queue(
          Ingestion::QueueManager::Queues.CAPTURE_ENDPOINT_DLQ, 
          { 'swishjam_api_key' => request.headers['X-Swishjam-Api-Key'], 'payload' => request.body.read }
        )
        Sentry.capture_exception(e)
        render json: { error: e.message }, status: :internal_server_error
      end
    end
  end
end