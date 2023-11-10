module Api
  module V1
    module Webhooks
      class ResendController < BaseController
        def receive
          workspace = Workspace.find(params[:workspace_id])
          public_key = workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.RESEND).public_key
          swishjam_obj = {
            'uuid' => params.dig('data', 'email_id'),
            'event' => params['type'],
            'timestamp' => DateTime.parse(params.dig('data', 'created_at')).to_i * 1_000,
            'source' => 'resend',
            'from' => params.dig('data', 'from'),
            'to' => (params.dig('data', 'to') || []).join(', '),
            'subject' => params.dig('data', 'subject'),
          }
          if params['type'] == 'email.clicked'
            swishjam_obj['click_ip_address'] = params.dig('click', 'ipAddress')
            swishjam_obj['click_link'] = params.dig('click', 'link')
            swishjam_obj['click_timestamp'] = params.dig('click', 'timestamp')
            swishjam_obj['click_user_agent'] = params.dig('click', 'userAgent')
          end
          if (ENV['API_KEYS_FOR_NEW_INGESTION'] || '').split(',').map{ |s| s.strip }.include?(public_key)
            formatted_event = Analytics::Event.formatted_for_ingestion(
              uuid: swishjam_obj['uuid'],
              swishjam_api_key: public_key,
              name: swishjam_obj['event'],
              occurred_at: Time.at(swishjam_obj['timestamp'] / 1_000),
              properties: swishjam_obj.except('uuid', 'event', 'timestamp', 'source'),
            )
            Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, [formatted_event])
          else
            CaptureAnalyticDataJob.perform_async(public_key, [swishjam_obj], nil)
          end
        end
      end
    end
  end
end