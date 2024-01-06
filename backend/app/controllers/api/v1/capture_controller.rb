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
            properties: e['attributes'] || e.except('uuid', 'event', 'event_name', 'name', 'timestamp', 'source'),
          )
        end
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, events)
        render json: { message: 'ok' }, status: :ok
      rescue => e
        Rails.logger.error "Error capturing analytic event: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        Sentry.capture_exception(e) if ENV['SENTRY_DSN'].present?
        render json: { error: e.message }, status: :bad_request
      end

      def server_side_event
        private_key = request.headers['X-Swishjam-Api-Key']
        if params[:name].blank?
          render json: { error: 'Missing required `name` key in provided payload' }, status: :bad_request
          return
        end
        if private_key.blank?
          render json: { error: 'Missing Swishjam secret key, please provide it in the X-Swishjam-Api-Key header.' }, status: :bad_request
          return
        end
        
        public_key = Rails.cache.fetch("public_key_for_private_key_#{private_key}", expires_in: 7.days) do
          ApiKey.find_by(private_key: private_key)&.public_key
        end
        if public_key.blank?
          render json: { error: "Invalid Swishjam secret key provided: #{private_key}." }, status: :unauthorized
          return
        end

        event = Analytics::Event.formatted_for_ingestion(
          uuid: params[:uuid] || "evt-#{SecureRandom.uuid}", 
          swishjam_api_key: public_key, 
          name: params[:name], 
          occurred_at: Time.at(params[:timestamp] || Time.current.to_i),
          properties: (params[:attributes] || {}).as_json,
        )
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, event)
        render json: { message: 'ok' }, status: :ok
      rescue => e
        Sentry.capture_exception(e)
        render json: { error: e.message }, status: :internal_server_error
      end
    end
  end
end