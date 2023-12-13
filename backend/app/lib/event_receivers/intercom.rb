module EventReceivers
  class Intercom
    PARSER_KLASSES = {
      'conversation.user.created' => Intercom::EventPayloadParsers::ConversationUserCreated,
      'conversation.admin.replied' => Intercom::EventPayloadParsers::ConversationAdminReplied,
      'conversation.admin.closed' => Intercom::EventPayloadParsers::ConversationAdminReplied,
    }
    
    def initialize(event_payload)
      @event_payload = event_payload
    end

    def receive!
      integration = Integrations::Intercom.find_by_app_id(@event_payload['app_id'])
      if integration
        public_key = integration.workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.INTERCOM)&.public_key
        if public_key
          parser_klass = PARSER_KLASSES[@event_payload['topic']] || Intercom::EventPayloadParsers::Default
          event_data = parser_klass.new(integration.workspace, @event_payload, public_key).to_json
          formatted_event = Analytics::Event.formatted_for_ingestion(
            uuid: event_data[:uuid],
            swishjam_api_key: public_key, 
            name: event_data[:name],
            occurred_at: event_data[:occurred_at],
            properties: event_data[:properties],
          )
          Ingestion::QueueManager.push_records_into_queue(Ingestion::QueueManager::Queues.EVENTS, [formatted_event])
          true
        else
          Sentry.capture_message("Received Intercom event from app #{integration.config['app_id']}, but unable to find `APIKey` for Integration record (#{integration.id}).", level: 'error')
          false
        end
      else
        Sentry.capture_message("Received Intercom event from app #{@event_payload['app_id']}, but unable to find matching enabled Intercom integration record.")
        false
      end
    end
  end
end