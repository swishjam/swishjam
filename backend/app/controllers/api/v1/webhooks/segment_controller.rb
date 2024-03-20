module Api
  module V1
    module Webhooks
      class SegmentController < BaseController
        def receive
          # TODO: read from the X-Signature header?
          api_key = request.headers['X-Swishjam-Api-Key']
          if api_key.blank?
            render json: { error: 'Swishjam API Key not present, please provide it in the X-Swishjam-Api-Key header.' }, status: :bad_request
            return
          end

          if !ENV['BYPASS_API_KEY_CHECKS_DURING_INGESTION'].present? && !ApiKey.enabled.where(public_key: api_key).exists?
            msg = "Invalid Swishjam API Key provided to Segment webhook endpoint: #{api_key}."
            Sentry.capture_message(msg)
            render json: { error: msg }, status: :unauthorized
            return
          end

          events = JSON.parse(request.body.read || '[]')
          events = [events] if events.is_a?(Hash)
          if events.length > (ENV['MAX_EVENTS_IN_CAPTURE_REQUEST'] || 100).to_i
            msg = "Invalid payload format. Cannot send more than #{ENV['MAX_EVENTS_IN_CAPTURE_REQUEST'] || 100} events in one request."
            Sentry.capture_message(msg)
            render json: { error: msg }, status: :bad_request
            return
          end

          events_to_prepare = events.map do |event|
            # `.track` events have an `event` property, otherwise use type
            event_name = event['event'] || event['type'] == 'page' ? Analytics::Event::ReservedNames.PAGE_VIEW : event['type']
            Ingestion::EventsPreparer.format_for_events_to_prepare_queue(
              uuid: event['messageId'],
              swishjam_api_key: api_key,
              name: "segment.#{event_name}", 
              occurred_at: DateTime.parse(event['originalTimestamp']),
              properties: event.as_json,
            )
          end

          IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter.perform_async(events_to_prepare)
          render json: { message: 'received' }, status: :ok
        end
      end
    end
  end
end