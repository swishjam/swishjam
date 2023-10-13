module Api
  module V1
    module Webhooks
      class ResendController < BaseController
        def receive
          workspace = Workspace.find(params[:workspace_id])
          payload = JSON.parse(request.body.read)
          public_key = workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.RESEND).public_key
          swishjam_obj = {
            uuid: payload.dig('data', 'email_id'),
            event: payload['type'],
            timestamp: DateTime.parse(payload.dig('data', 'created_at')).to_i * 1_000,
            source: 'resend',
            from: payload['from'],
            to: (payload['to'] || []).join(', '),
            subject: payload['subject'],
          }
          if payload['type'] == 'email.clicked'
            swishjam_obj[:click_ip_address] = payload.dig('click', 'ipAddress')
            swishjam_obj[:click_link] = payload.dig('click', 'link')
            swishjam_obj[:click_timestamp] = payload.dig('click', 'timestamp')
            swishjam_obj[:click_user_agent] = payload.dig('click', 'userAgent')
          end
          CaptureAnalyticDataJob.perform_async(public_key, [swishjam_obj], nil)
        end
      end
    end
  end
end