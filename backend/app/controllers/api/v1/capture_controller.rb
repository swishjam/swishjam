module Api
  module V1
    class CaptureController < ApplicationController
      def process_data
        api_key = request.headers['X-Swishjam-Api-Key']
        if api_key.blank?
          render json: { error: 'Swishjam API Key not present, please provide it in the X-Swishjam-Api-Key header.' }, status: :bad_request
          return
        end
        if !ApiKey.enabled.where(public_key: api_key).exists?
          msg = "Invalid Swishjam API Key provided to capture endpoint: #{api_key}."
          Sentry.capture_message(msg)
          render json: { error: msg }, status: :unauthorized
          return
        end

        payload = JSON.parse(request.body.read || '{}')
        events = nil
        if payload.is_a?(Array)
          events = payload.map do |e|
            Ingestion::EventsPreparer.format_for_events_to_prepare_queue(
              uuid: e['uuid'],
              swishjam_api_key: api_key,
              name: e['event'] || e['name'],
              occurred_at: e['timestamp'],
              properties: e['attributes'] || e['properties'] || e.except('uuid', 'event', 'event_name', 'name', 'timestamp', 'source'),
            )
          end
        elsif payload.is_a?(Hash)
          event = Ingestion::EventsPreparer.format_for_events_to_prepare_queue(
            uuid: payload['uuid'] || "evt-#{SecureRandom.uuid}",
            swishjam_api_key: api_key,
            name: payload['event'] || payload['name'],
            occurred_at: payload['timestamp'] || Time.current.to_f,
            properties: payload['attributes'] || payload['properties'] || payload.except('uuid', 'event', 'event_name', 'name', 'timestamp', 'source'),
          )
          events = [event]
        else
          render json: { error: 'Invalid payload format. Request body must be either an array of events, or a single event hash.' }, status: :bad_request
          return
        end

        IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter.perform_async(events)
        render json: { message: 'ok' }, status: :ok
      rescue => e
        Sentry.capture_exception(e)
        render json: { error: e.message }, status: :internal_server_error
      end

      # same exact method as above, different endpoint (/api/v1/capture and /api/v1/event)
      # silly, but supporting it for now
      def server_side_event
        api_key = request.headers['X-Swishjam-Api-Key']
        if api_key.blank?
          render json: { error: 'Swishjam API Key not present, please provide it in the X-Swishjam-Api-Key header.' }, status: :bad_request
          return
        end
        if !ApiKey.enabled.where(public_key: api_key).exists?
          msg = "Invalid Swishjam API Key provided to capture endpoint: #{api_key}."
          Sentry.capture_message(msg)
          render json: { error: msg }, status: :unauthorized
          return
        end

        payload = JSON.parse(request.body.read || '{}')
        events = nil
        if payload.is_a?(Array)
          events = payload.map do |e|
            Ingestion::EventsPreparer.format_for_events_to_prepare_queue(
              uuid: e['uuid'],
              swishjam_api_key: api_key,
              name: e['event'] || e['name'],
              occurred_at: e['timestamp'],
              properties: e['attributes'] || e['properties'] || e.except('uuid', 'event', 'event_name', 'name', 'timestamp', 'source'),
            )
          end
        elsif payload.is_a?(Hash)
          event = Ingestion::EventsPreparer.format_for_events_to_prepare_queue(
            uuid: payload['uuid'] || "evt-#{SecureRandom.uuid}",
            swishjam_api_key: api_key,
            name: payload['event'] || payload['name'],
            occurred_at: payload['timestamp'] || Time.current.to_f,
            properties: payload['attributes'] || payload['properties'] || payload.except('uuid', 'event', 'event_name', 'name', 'timestamp', 'source'),
          )
          events = [event]
        else
          render json: { error: 'Invalid payload format. Request body must be either an array of events, or a single event hash.' }, status: :bad_request
          return
        end

        IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter.perform_async(events)
        render json: { message: 'ok' }, status: :ok
      rescue => e
        Sentry.capture_exception(e)
        render json: { error: e.message }, status: :internal_server_error
      end
    end
  end
end