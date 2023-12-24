module EventReceivers
  class Github
    def initialize(event_type:, event_uuid:, payload:)
      @event_uuid = event_uuid
      @event_type = event_type
      @event_payload = payload
    end

    def receive!
      byebug
      if integration && integration.enabled?
        case @event_type
        when 'pull_request'
          push_into_ingestion_queue(
            occurred_at: DateTime.parse(@event_payload.dig('pull_request', 'updated_at') || @event_payload.dig('pull_request', 'created_at') || DateTime.now.to_s),
            properties: ::Github::EventPayloadParsers::PullRequest.new(@event_payload).to_json,
          )
        when 'push'
          push_into_ingestion_queue(
            occurred_at: DateTime.now, # I'm not sure if there's a timestamp for pushes?
            properties: ::Github::EventPayloadParsers::Push.new(@event_payload).to_json,
          )
        when 'star'
          push_into_ingestion_queue(
            occurred_at: DateTime.parse(@event_payload.dig('starred_at') || DateTime.now.to_s), # I don't think there's a timestamp for deleted stars
            properties: ::Github::EventPayloadParsers::Star.new(@event_payload).to_json,
          )
        when 'issues'
          push_into_ingestion_queue(
            occurred_at: DateTime.parse(@event_payload.dig('issue', 'updated_at') || @event_payload.dig('issue', 'created_at') || DateTime.now.to_s),
            properties: ::Github::EventPayloadParsers::Issue.new(@event_payload).to_json,
          )
        when 'issue_comment'
          push_into_ingestion_queue(
            occurred_at: DateTime.parse(@event_payload.dig('comment', 'updated_at') || @event_payload.dig('comment', 'created_at') || DateTime.now.to_s),
            properties: ::Github::EventPayloadParsers::IssueComment.new(@event_payload).to_json,
          )
        when 'deployment'
          push_into_ingestion_queue(
            occurred_at: DateTime.parse(@event_payload.dig('deployment', 'created_at') || DateTime.now.to_s),
            properties: ::Github::EventPayloadParsers::Deployment.new(@event_payload).to_json,
          )
        else
          Sentry.capture_message("Received Github event of type #{@event_type}, but no parser exists to ingest the event, skipping...")
          false
        end
      else
        Sentry.capture_message("Received Github for installation ID #{installation_id}, but unable to find matching enabled Github Integration record.")
        false
      end  
    end

    def push_into_ingestion_queue(occurred_at:, properties:)
      Ingestion::QueueManager.push_records_into_queue(
        Ingestion::QueueManager::Queues.EVENTS,
        Analytics::Event.formatted_for_ingestion(
          uuid: @event_uuid,
          swishjam_api_key: public_key,
          name: "github.#{@event_type}.#{@event_payload.dig('github', 'action')}",
          occurred_at: occurred_at,
          properties: properties,
        )
      )
    end

    def installation_id
      @event_payload.dig('installation', 'id')
    end

    def workspace
      @workspace ||= integration.workspace
    end

    def public_key
      @public_key ||= workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.GITHUB)&.public_key
    end

    def integration
      @integration ||= Integrations::Github.find_by_config_attribute('installation_id', installation_id.to_s)
    end
  end
end