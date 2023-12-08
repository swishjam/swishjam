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
          event_properties = {
            'type' => params.dig('payload', 'type'),
            'title' => params.dig('payload', 'title'),
            'description' => params.dig('payload', 'description'),
            'start_time' => params.dig('payload', 'startTime') ? DateTime.parse(params.dig('payload', 'startTime')) : '',
            'end_time' => params.dig('payload', 'endTime') ? DateTime.parse(params.dig('payload', 'endTime')) : '',
            'length' => params.dig('payload', 'length'),
            'attendees' => (params.dig('payload', 'attendees') || []).map{ |a| a['email'] }.join(', '),
          }
          (params.dig('payload', 'responses') || {}).keys.each do |key|
            value = params.dig('payload', 'responses', key, 'value')
            next if !value.is_a?(String)
            event_properties["response_#{key}"] = params.dig('payload', 'responses', key, 'value')
          end

          if params.dig('payload', 'attendees') && params.dig('payload', 'attendees').any?
            attendee_email = params.dig('payload', 'attendees')[0]['email']
            maybe_attendee_user_profile = workspace.analytics_user_profiles.find_by_case_insensitive_email(attendee_email)
            if maybe_attendee_user_profile
              event_properties[Analytics::Event::ReservedPropertyNames.USER_PROFILE_ID] = maybe_attendee_user_profile.id
            else
              new_user_profile = AnalyticsUserProfile.create!(
                workspace: workspace,
                email: attendee_email,
                created_by_data_source: ApiKey::ReservedDataSources.CAL_COM,
              )
              Sentry.capture_message("Could not find user profile for Cal.com event #{params['triggerEvent']} attendee email #{attendee_email} in workspace #{workspace.name} (#{workspace.id})")
            end
          end

          formatted_event = Analytics::Event.formatted_for_ingestion(
            uuid: params.dig('payload', 'uid') || SecureRandom.uuid,
            swishjam_api_key: public_key,
            name: "cal.#{params['triggerEvent']}",
            occurred_at: DateTime.parse(params['createdAt']),
            properties: event_properties,
          )
          Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, [formatted_event])
          render json: { message: 'ok' }, status: :ok
        end
      end
    end
  end
end