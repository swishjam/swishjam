module Api
  module V1
    module Webhooks
      class ResendController < BaseController
        def receive
          workspace = Workspace.find(params[:workspace_id])
          public_key = workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.RESEND).public_key
          event_payload = {
            'from' => params.dig('data', 'from'),
            'to' => (params.dig('data', 'to') || []).join(', '),
            'subject' => params.dig('data', 'subject'),
          }

          if (params.dig('data', 'to') || []).any?
            email = params.dig('data', 'to')[0]
            maybe_user_profile = workspace.analytics_user_profiles.find_by_case_insensitive_email(email)
            if maybe_user_profile
              event_payload[Analytics::Event::ReservedPropertyNames.USER_PROFILE_ID] = maybe_user_profile.id
            else
              new_user_profile = AnalyticsUserProfile.create!(
                workspace: workspace, 
                email: email,
                created_by_data_source: ApiKey::ReservedDataSources.RESEND,
              )
              event_payload[Analytics::Event::ReservedPropertyNames.USER_PROFILE_ID] = new_user_profile.id
              Sentry.capture_message("Could not find user profile for Resend event #{params['type']} email #{email} in workspace #{workspace.name} (#{workspace.id}), so we created a new one (#{new_user_profile.id})")
            end
          end

          if params['type'] == 'email.clicked'
            event_payload['click_ip_address'] = params.dig('click', 'ipAddress')
            event_payload['click_link'] = params.dig('click', 'link')
            event_payload['click_timestamp'] = params.dig('click', 'timestamp')
            event_payload['click_user_agent'] = params.dig('click', 'userAgent')
          end

          formatted_event = Analytics::Event.formatted_for_ingestion(
            uuid: params.dig('data', 'email_id'),
            swishjam_api_key: public_key,
            name: "resend.#{params['type']}"
            occurred_at: DateTime.parse(params.dig('data', 'created_at')),
            properties: event_payload.except('uuid', 'event', 'timestamp'),
          )
          Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, [formatted_event])
        end
      end
    end
  end
end