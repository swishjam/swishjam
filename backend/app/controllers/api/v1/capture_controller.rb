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
            uuid: payload['uuid'],
            swishjam_api_key: api_key,
            name: payload['event'] || payload['name'],
            occurred_at: payload['timestamp'],
            properties: payload['attributes'] || payload['properties'] || payload.except('uuid', 'event', 'event_name', 'name', 'timestamp', 'source'),
          )
          events = [event]
        else
          render json: { error: 'Invalid payload format. Request body must be either an array of events, or a single event hash.' }, status: :bad_request
          return
        end
        # TODO: I think it might make sense for us to enqueue the prepare events JOB, and the ClickHouse writer job will just pull from the prepared events queue in a CRON
        # this will allow automations to be faster, and just one CRON to write to ClickHouse, instead of a second to also prepare the events

        # I think the ideal solution for our Sidekiq queues is we have a "reserved" amount of threads for ingestion jobs (ie: prepare events, event triggers, and write to ClickHouse)
        # but there's a few other jobs that are low priority (ie: data syncs and reports jobs (is that all the other jobs we care about?))
        # if the ingestion jobs are virtually _always_ running (ie: all 5 threads are always busy, with a couple procesing jobs queued up), will that prevent
        # the low priority jobs from ever running? Do we need a dedicated process for the ingestion jobs so they don't completely block every other job?
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS_TO_PREPARE, events)
        render json: { message: 'ok' }, status: :ok
      rescue => e
        Sentry.capture_exception(e)
        render json: { error: e.message }, status: :internal_server_error
      end

      def server_side_event
        private_key = request.headers['X-Swishjam-Api-Key']
        payload = JSON.parse(request.body.read || '{}')

        if payload.is_a?(Hash) && payload['name'].blank?
          render json: { error: 'Missing required `name` key in provided payload' }, status: :bad_request
          return
        end
        if private_key.blank?
          render json: { error: 'Missing Swishjam secret key, please provide it in the X-Swishjam-Api-Key header.' }, status: :bad_request
          return
        end
        
        public_key = Rails.cache.fetch("public_key_for_private_key_#{private_key}", expires_in: 30.days) do
          ApiKey.find_by(private_key: private_key)&.public_key
        end
        if public_key.blank?
          render json: { error: "Invalid Swishjam secret key provided: #{private_key}." }, status: :unauthorized
          return
        end

        payload = [payload] if payload.is_a?(Hash)
        events = payload.map do |e|
          event = Analytics::Event.formatted_for_ingestion(
            uuid: e['uuid'] || "evt-#{SecureRandom.uuid}", 
            swishjam_api_key: public_key, 
            name: e['name'], 
            occurred_at: Time.at(e['timestamp'] || Time.current.to_i),
            properties: (e['attributes'] || {}).as_json,
          )
        end
        Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, events)
        render json: { message: 'ok' }, status: :ok
      rescue => e
        Sentry.capture_exception(e)
        render json: { error: e.message }, status: :internal_server_error
      end
    end
  end
end