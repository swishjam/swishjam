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
        if ENV['USE_LEGACY_CAPTURE_ANALYTIC_DATA_JOB_DURING_INGESTION']
          CaptureAnalyticDataJob.perform_async(api_key, payload, request.ip)
        else
          events = payload.map do |e|
            {
              uuid: e['uuid'],
              swishjam_api_key: api_key,
              name: e['event'] || e['event_name'] || e['name'],
              occurred_at: e['timestamp'] / 1_000,
              properties: e.except('uuid', 'event', 'timestamp', 'name', 'source', 'sdk_version')
            }.to_json
          end
          Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, events)
        end
        render json: { message: 'ok' }, status: :ok
      rescue => e
        Rails.logger.error "Error capturing analytic event: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        Sentry.capture_exception(e) if ENV['SENTRY_DSN'].present?
        render json: { error: e.message }, status: :bad_request
      end
    end
  end
end