module Github
  module EventPayloadParsers
    class Deployment
      def initialize(event_payload)
        @event_payload = event_payload
      end

      def to_json
        {
          repo: @event_payload.dig('repository', 'full_name'),
          deployment_id: @event_payload.dig('deployment', 'id'),
          environment: @event_payload.dig('deployment', 'environment'),
          description: @event_payload.dig('deployment', 'description'),
          deployed_by: @event_payload.dig('deployment', 'creator', 'login'),
          task: @event_payload.dig('deployment', 'task'),
        }
      end
    end
  end
end