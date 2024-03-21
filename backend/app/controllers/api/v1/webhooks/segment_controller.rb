module Api
  module V1
    module Webhooks
      class SegmentController < BaseController
        before_action :authenticate_signature!

        def receive
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
              swishjam_api_key: @segment_api_record.public_key,
              name: "segment.#{event_name}", 
              occurred_at: DateTime.parse(event['timestamp']),
              properties: event.as_json,
            )
          end

          IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter.perform_async(events_to_prepare)
          render json: { message: 'received' }, status: :ok
        end

        private

        def authenticate_signature!
          if request.headers['X-Signature'].blank?
            render json: { error: 'No signature provided in X-Signature header.' }, status: :bad_request
            return
          end
          @segment_api_record = Integrations::Segment.find(params[:integration_id]).swishjam_api_key
          # WHY DO TEST EVENTS HAVE VALID SIGNATUES BUT NOT REAL EVENTS?
          # computed_signature = OpenSSL::HMAC.hexdigest('SHA1', @segment_api_record.private_key, request.raw_post)
          # is_valid_signature = Rack::Utils.secure_compare(computed_signature, request.headers['X-Signature'])
          # if !is_valid_signature
          #   render json: { 
          #     error: "Invalid signature provided in X-Signature header: #{request.headers['X-Signature']}",
          #     body_computed_signature_with: request.raw_post,
          #   }, status: :unauthorized
          #   return
          # end
        rescue ActiveRecord::RecordNotFound => e
          render json: { error: "Invalid Webhook URL. Either you deleted your Segment data source in your Swishjam instance, or the Webhook URL was inputted incorrectly into Segment." }, status: :bad_request
          return
        end
      end
    end
  end
end