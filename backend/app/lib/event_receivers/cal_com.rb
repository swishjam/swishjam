module EventReceivers
  class CalCom
    def initialize(workspace_id, event_payload)
      @workspace = Workspace.find(workspace_id)
      @event_payload = event_payload
    end

    def receive!
      return if @event_payload['triggerEvent'] == 'PING'
      # TODO: verify signature
      # provided_secret = request.headers['X-Cal-Signature-256']
      integration = @workspace.integrations.enabled.by_type(Integrations::CalCom).first
      if integration.nil?
        Sentry.capture_message("Received Cal.com event from workspace #{@workspace_id}, but unable to find matching enabled Cal.com integration.")
        return
      end

      public_key = @workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.CAL_COM).public_key
      event_properties = build_event_properties!

      formatted_event = Analytics::Event.formatted_for_ingestion(
        uuid: @event_payload.dig('payload', 'uid') || SecureRandom.uuid,
        swishjam_api_key: public_key,
        name: "cal.#{@event_payload['triggerEvent']}",
        occurred_at: DateTime.parse(@event_payload['createdAt']),
        properties: event_properties,
      )
      Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, [formatted_event])
    end

    private 

    def build_event_properties!
      event_properties = {
        'type' => @event_payload.dig('payload', 'type'),
        'title' => @event_payload.dig('payload', 'title'),
        'description' => @event_payload.dig('payload', 'description'),
        'start_time' => @event_payload.dig('payload', 'startTime') ? DateTime.parse(@event_payload.dig('payload', 'startTime')) : '',
        'end_time' => @event_payload.dig('payload', 'endTime') ? DateTime.parse(@event_payload.dig('payload', 'endTime')) : '',
        'length' => @event_payload.dig('payload', 'length'),
        'attendees' => (@event_payload.dig('payload', 'attendees') || []).map{ |a| a['email'] }.join(', '),
      }

      (@event_payload.dig('payload', 'responses') || {}).keys.each do |key|
        value = @event_payload.dig('payload', 'responses', key, 'value')
        next if !value.is_a?(String)
        event_properties["response_#{key}"] = @event_payload.dig('payload', 'responses', key, 'value')
      end

      try_to_associate_user_profile_with_event!(event_properties)
    end

    def try_to_associate_user_profile_with_event!(event_properties)
      if @event_payload.dig('payload', 'attendees') && @event_payload.dig('payload', 'attendees').any?
        attendee_email = @event_payload.dig('payload', 'attendees')[0]['email']
        maybe_attendee_user_profile = @workspace.analytics_user_profiles.find_by_case_insensitive_email(attendee_email)
        if maybe_attendee_user_profile
          event_properties[Analytics::Event::ReservedPropertyNames.USER_PROFILE_ID] = maybe_attendee_user_profile.id
        else
          new_user_profile = AnalyticsUserProfile.create!(
            workspace: @workspace,
            email: attendee_email,
            created_by_data_source: ApiKey::ReservedDataSources.CAL_COM,
          )
          event_properties[Analytics::Event::ReservedPropertyNames.USER_PROFILE_ID] = new_user_profile.id
          Sentry.capture_message("Could not find user profile for Cal.com event #{@event_payload['triggerEvent']} attendee email #{attendee_email} in workspace #{@workspace.name} (#{@workspace.id}), so we created a new one (#{new_user_profile.id})")
        end
      end
      event_properties
    end
  end
end