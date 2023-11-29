module Api
  module V1
    module Webhooks
      class CalComController < BaseController
        def receive
          workspace = Workspace.find(params[:workspace_id])
          if params['triggerEvent'] == 'PING'
            render json: { message: 'ok' }, status: :ok
            return
          end
          # TODO: verify signature
          # provided_secret = request.headers['X-Cal-Signature-256']
          public_key = workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.CAL_COM).public_key
          integration = workspace.integrations.enabled.find_by!(type: Integrations::CalCom.to_s)
          swishjam_obj = {
            'swishjam_api_key' => public_key,
            'uuid' => params.dig('payload', 'uid') || SecureRandom.uuid,
            'name' => "cal.#{params['triggerEvent']}",
            'timestamp' => DateTime.parse(params['createdAt']).to_i * 1_000,
            'source' => 'cal.com',
            'type' => params.dig('payload', 'type'),
            'title' => params.dig('payload', 'title'),
            'description' => params.dig('payload', 'description'),
            'start_time' => params.dig('payload', 'startTime') ? DateTime.parse(params.dig('payload', 'startTime')) : '',
            'end_time' => params.dig('payload', 'endTime') ? DateTime.parse(params.dig('payload', 'endTime')) : '',
            'length' => params.dig('payload', 'length'),
          }
          (params.dig('payload', 'responses') || {}).keys.each do |key|
            value = params.dig('payload', 'responses', key, 'value')
            next if !value.is_a?(String)
            swishjam_obj["response_#{key}"] = params.dig('payload', 'responses', key, 'value')
          end
          formatted_event = Analytics::Event.formatted_for_ingestion(
            uuid: swishjam_obj['uuid'],
            swishjam_api_key: public_key,
            name: swishjam_obj['name'],
            occurred_at: Time.at(swishjam_obj['timestamp'] / 1_000),
            properties: swishjam_obj.except('uuid', 'name', 'timestamp', 'source'),
          )
          Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, [formatted_event])
          render json: { message: 'ok' }, status: :ok
        end
      end
    end
  end
end