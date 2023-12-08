module EventReceivers
  class Resend
    def initialize(workspace_id, event_payload)
      @workspace = Workspace.find(workspace_id)
      @event_payload = event_payload
    end

    def receive!
      integration = @workspace.integrations.by_type(Integrations::Resend).first
      if integration.nil? || integration.disabled?
        Sentry.capture_message("Received Resend event from workspace #{@workspace_id}, but unable to find matching enabled Resend integration record.")
        return false
      end

      public_key = @workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.RESEND)&.public_key
      if public_key.nil?
        Sentry.capture_message("Received Resend event from workspace #{@workspace_id}, but unable to find Resend data source API key.")
        return false
      end

      swishjam_event_properties = {
        'from' => @event_payload.dig('data', 'from'),
        'to' => (@event_payload.dig('data', 'to') || []).join(', '),
        'subject' => @event_payload.dig('data', 'subject'),
      }

      swishjam_event_properties = try_to_associate_user_profile_with_event!(swishjam_event_properties)

      if @event_payload['type'] == 'email.clicked'
        swishjam_event_properties['click_ip_address'] = @event_payload.dig('click', 'ipAddress')
        swishjam_event_properties['click_link'] = @event_payload.dig('click', 'link')
        swishjam_event_properties['click_timestamp'] = @event_payload.dig('click', 'timestamp')
        swishjam_event_properties['click_user_agent'] = @event_payload.dig('click', 'userAgent')
      end

      formatted_event = Analytics::Event.formatted_for_ingestion(
        uuid: @event_payload.dig('data', 'email_id'),
        swishjam_api_key: public_key,
        name: "resend.#{@event_payload['type']}",
        occurred_at: DateTime.parse(@event_payload.dig('data', 'created_at')),
        properties: swishjam_event_properties,
      )
      Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, [formatted_event])
    end

    private

    def try_to_associate_user_profile_with_event!(swishjam_event_properties)
      if (@event_payload.dig('data', 'to') || []).any?
        email = @event_payload.dig('data', 'to')[0]
        maybe_user_profile = @workspace.analytics_user_profiles.find_by_case_insensitive_email(email)
        if maybe_user_profile
          swishjam_event_properties[Analytics::Event::ReservedPropertyNames.USER_PROFILE_ID] = maybe_user_profile.id
        else
          new_user_profile = AnalyticsUserProfile.create!(
            workspace: @workspace, 
            email: email,
            created_by_data_source: ApiKey::ReservedDataSources.RESEND,
          )
          swishjam_event_properties[Analytics::Event::ReservedPropertyNames.USER_PROFILE_ID] = new_user_profile.id
          Sentry.capture_message("Could not find user profile for Resend event #{@event_payload['type']} email #{email} in @workspace #{@workspace.name} (#{@workspace.id}), so we created a new one (#{new_user_profile.id})")
        end
      end
      swishjam_event_properties
    end
  end
end