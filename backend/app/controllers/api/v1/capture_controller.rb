module Api
  module V1
    class CaptureController < ApplicationController
      def process_data
        api_key = request.headers['X-Swishjam-Api-Key']
        if api_key.blank?
          render json: { error: 'Not Authorized' }, status: :unauthorized
          return
        end
        payload = JSON.parse(request.body.read || '{}')
        events = payload.map do |e|
          Analytics::Event.formatted_for_ingestion(
            uuid: e['uuid'], 
            swishjam_api_key: api_key, 
            name: e['event'] || e['event_name'] || e['name'], 
            occurred_at: Time.at(e['timestamp'] / 1_000),
            properties: e['attributes'] || e.except('uuid', 'event', 'event_name', 'name', 'timestamp', 'source', 'sdk_version'),
          )
        end
        byebug
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, events)
        render json: { message: 'ok' }, status: :ok
      rescue => e
        byebug
        Rails.logger.error "Error capturing analytic event: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        Sentry.capture_exception(e) if ENV['SENTRY_DSN'].present?
        render json: { error: e.message }, status: :bad_request
      end
    end
  end
end